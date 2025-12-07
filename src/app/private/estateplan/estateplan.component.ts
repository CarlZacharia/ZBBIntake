// estateplan.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EstatePlanService } from '../../services/estateplan.service';
import { DataService } from '../../services/data.service';
import { PlanningService } from '../../services/planning.service';
import {
  EstatePlan,
  Will,
  Trust,
  PowerOfAttorney,
  HealthcareDirective,
  FiduciaryPoolMember,
  FiduciaryReference,
  BeneficiaryDesignation,
  SpecificDevise,
  SpecificBequest,
  GeneralBequest,
  EstatePlanValidation,
  EstatePlanConflict,
  createEmptyBeneficiaryDesignation,
  createEmptyFiduciaryPoolMember,
} from '../../models/estateplan.model';
import { Asset, NormalizedAssets } from '../../models/asset.model';

type EstatePlanTab = 'wills' | 'trusts' | 'poa' | 'healthcare' | 'fiduciaries';
type WillSubTab = 'client' | 'spouse';

@Component({
  selector: 'app-estateplan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estateplan.component.html',
  styleUrls: ['./estateplan.component.css'],
})
export class EstatePlanComponent implements OnInit, OnDestroy {

  // Tab state
  activeTab: EstatePlanTab = 'wills';
  activeWillSubTab: WillSubTab = 'client';

  // Data
  estatePlan: EstatePlan | null = null;
  clientName: string = 'Client';
  spouseName: string = 'Spouse';
  normalizedAssets: NormalizedAssets | null = null;
  validation: EstatePlanValidation | null = null;

  // UI State
  showFiduciaryModal: boolean = false;
  editingFiduciary: FiduciaryPoolMember | null = null;
  showAssetSelector: boolean = false;
  assetSelectorContext: { type: 'devise' | 'bequest'; will: 'client' | 'spouse' } | null = null;

  // Subscriptions
  private estatePlanSub: Subscription | null = null;

  constructor(
    private estatePlanService: EstatePlanService,
    private dataService: DataService,
    private planningService: PlanningService
  ) {}

  ngOnInit(): void {
    // Subscribe to estate plan changes
    this.estatePlanSub = this.estatePlanService.estatePlan$.subscribe(plan => {
      this.estatePlan = plan;
      this.runValidation();
    });

    // Get client/spouse names
    this.loadNames();

    // Get normalized assets for validation and linking
    this.loadNormalizedAssets();
  }

  ngOnDestroy(): void {
    this.estatePlanSub?.unsubscribe();
  }

  private loadNames(): void {
    const personal = this.dataService.personal();
    const maritalInfo = this.dataService.maritalInfo();

    if (personal) {
      this.clientName = `${personal.legal_first_name || ''} ${personal.legal_last_name || ''}`.trim() || 'Client';
    }
    if (maritalInfo && maritalInfo.spouse_legal_name) {
      this.spouseName = maritalInfo.spouse_legal_name || 'Spouse';
    }
  }

  private loadNormalizedAssets(): void {
    const assets = this.dataService.assets();
    if (assets) {
      // Map IAssets property names to what PlanningService expects
      this.normalizedAssets = this.planningService.normalizeAssets({
        realEstate: assets.real_estate_holdings || [],
        bank: assets.bank_account_holdings || [],
        nq: assets.nq_account_holdings || [],
        retirement: assets.retirement_account_holdings || [],
        lifeInsurance: assets.life_insurance_holdings || [],
        business: assets.business_interest_holdings || [],
        digital: assets.digital_asset_holdings || [],
        other: assets.other_asset_holdings || []
      });
    }
  }

  private runValidation(): void {
    if (!this.normalizedAssets) {
      this.loadNormalizedAssets();
    }
    if (this.normalizedAssets) {
      this.validation = this.estatePlanService.validateEstatePlan(this.normalizedAssets);
    }
  }

  // ============ TAB NAVIGATION ============

  setActiveTab(tab: EstatePlanTab): void {
    this.activeTab = tab;
  }

  setWillSubTab(subTab: WillSubTab): void {
    this.activeWillSubTab = subTab;
  }

  // ============ WILL OPERATIONS ============

  get clientWill(): Will | null {
    return this.estatePlan?.clientWill || null;
  }

  get spouseWill(): Will | null {
    return this.estatePlan?.spouseWill || null;
  }

  initializeClientWill(): void {
    this.estatePlanService.initializeClientWill();
  }

  initializeSpouseWill(): void {
    this.estatePlanService.initializeSpouseWill();
  }

  // ============ FIDUCIARY POOL ============

  /**
   * Combined fiduciary pool from:
   * 1. Client heirs (spouse, children, family members, charities)
   * 2. Spouse heirs (client, children, family members, charities)
   * 3. Manually added fiduciaries in estate plan
   */
  get fiduciaryPool(): FiduciaryPoolMember[] {
    const pool: FiduciaryPoolMember[] = [];
    const seenIds = new Set<string>();

    // Add client heirs
    const clientHeirs = this.dataService.getClientHeirsArray();
    for (const heir of clientHeirs) {
      if (!seenIds.has(heir.id)) {
        seenIds.add(heir.id);
        pool.push({
          id: heir.id,
          name: heir.name,
          relationship: heir.type,
          isEntity: heir.type === 'Charity',
          entityType: heir.type === 'Charity' ? 'Charity' : undefined,
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: '',
          notes: ''
        });
      }
    }

    // Add spouse heirs (includes client from spouse's perspective)
    const spouseHeirs = this.dataService.getSpouseHeirsArray();
    for (const heir of spouseHeirs) {
      if (!seenIds.has(heir.id)) {
        seenIds.add(heir.id);
        pool.push({
          id: heir.id,
          name: heir.name,
          relationship: heir.type,
          isEntity: heir.type === 'Charity',
          entityType: heir.type === 'Charity' ? 'Charity' : undefined,
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: '',
          notes: ''
        });
      }
    }

    // Add manually added fiduciaries from estate plan
    const manualFiduciaries = this.estatePlan?.fiduciaryPool || [];
    for (const fid of manualFiduciaries) {
      if (!seenIds.has(fid.id)) {
        seenIds.add(fid.id);
        pool.push(fid);
      }
    }

    return pool;
  }

  /**
   * Get only manually added fiduciaries (for the Fiduciary Pool tab display)
   */
  get manualFiduciaryPool(): FiduciaryPoolMember[] {
    return this.estatePlan?.fiduciaryPool || [];
  }

  /**
   * Get combined client and spouse heirs for display (without duplicates)
   */
  get clientHeirsForDisplay(): Array<{ id: string; name: string; type: string }> {
    const heirs: Array<{ id: string; name: string; type: string }> = [];
    const seenIds = new Set<string>();

    // Add client heirs
    for (const heir of this.dataService.getClientHeirsArray()) {
      if (!seenIds.has(heir.id)) {
        seenIds.add(heir.id);
        heirs.push(heir);
      }
    }

    // Add spouse heirs (includes client from spouse's perspective)
    for (const heir of this.dataService.getSpouseHeirsArray()) {
      if (!seenIds.has(heir.id)) {
        seenIds.add(heir.id);
        heirs.push(heir);
      }
    }

    return heirs;
  }

  openAddFiduciaryModal(): void {
    this.editingFiduciary = createEmptyFiduciaryPoolMember();
    this.showFiduciaryModal = true;
  }

  openEditFiduciaryModal(member: FiduciaryPoolMember): void {
    this.editingFiduciary = { ...member };
    this.showFiduciaryModal = true;
  }

  saveFiduciary(): void {
    if (!this.editingFiduciary) return;

    const existing = this.estatePlanService.getFiduciaryById(this.editingFiduciary.id);
    if (existing) {
      this.estatePlanService.updateFiduciaryInPool(this.editingFiduciary);
    } else {
      this.estatePlanService.addFiduciaryToPool(this.editingFiduciary);
    }

    this.showFiduciaryModal = false;
    this.editingFiduciary = null;
  }

  cancelFiduciaryEdit(): void {
    this.showFiduciaryModal = false;
    this.editingFiduciary = null;
  }

  removeFiduciary(memberId: string): void {
    if (confirm('Are you sure you want to remove this person from the fiduciary pool?')) {
      this.estatePlanService.removeFiduciaryFromPool(memberId);
    }
  }

  // Create a FiduciaryReference from a pool member ID
  selectFiduciary(poolId: string): FiduciaryReference | null {
    const member = this.estatePlanService.getFiduciaryById(poolId);
    if (!member) return null;
    return this.estatePlanService.createFiduciaryReference(member);
  }

  // ============ EXECUTOR SELECTION ============

  setExecutor(will: Will, position: 'primary' | 'secondary' | 'tertiary', poolId: string | null): void {
    if (poolId === null || poolId === '') {
      will.executors[position] = null;
    } else {
      const ref = this.selectFiduciary(poolId);
      will.executors[position] = ref;
    }
    this.estatePlanService.setClientWill(this.clientWill);
  }

  // ============ SPECIFIC DEVISES ============

  /**
   * Get available REAL ESTATE assets for specific devises
   * - Only real estate
   * - Only owned by the person whose will it is (or jointly with them)
   * - Exclude Life Estate and Lady Bird Deed (pass outside probate)
   * - Exclude assets already assigned to a devise
   */
  getAvailableAssetsForDevise(willType: 'client' | 'spouse'): Asset[] {
    if (!this.normalizedAssets) return [];
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return [];

    // Get IDs of assets already assigned to devises
    const assignedIds = new Set(will.specificDevises.map(d => `${d.assetIdname}|${d.assetId}`));

    return this.normalizedAssets.all.filter(asset => {
      // Must be real estate
      if (!asset.idname.startsWith('real_estate')) return false;

      // Must be owned by the correct person (check if ownedBy contains 'Client' or 'Spouse')
      const ownedBy = (asset.ownedBy || '').toString();
      if (willType === 'client') {
        // For Client's Will: include if Client is an owner
        if (!ownedBy.includes('Client')) return false;
      } else {
        // For Spouse's Will: include if Spouse is an owner
        if (!ownedBy.includes('Spouse')) return false;
      }

      // Exclude Life Estate and Lady Bird Deed (pass outside probate)
      const ownershipForm = (asset.ownershipForm || '').toString();
      if (ownershipForm === 'LifeEstate' || ownershipForm === 'LadyBirdDeed') return false;

      // Exclude already assigned assets
      if (assignedIds.has(`${asset.idname}|${asset.id}`)) return false;

      return true;
    });
  }

  /**
   * Get available PERSONAL PROPERTY assets for specific bequests
   * - Everything except real estate
   * - Only owned by the person whose will it is (or jointly with them)
   * - Exclude assets with beneficiary designations (has_bene === 'Yes')
   * - Exclude assets already assigned to a bequest
   */
  getAvailableAssetsForBequest(willType: 'client' | 'spouse'): Asset[] {
    if (!this.normalizedAssets) return [];
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return [];

    // Get IDs of assets already assigned to bequests
    const assignedIds = new Set(will.specificBequests.map(b => `${b.assetIdname}|${b.assetId}`));

    return this.normalizedAssets.all.filter(asset => {
      // Must NOT be real estate
      if (asset.idname.startsWith('real_estate')) return false;

      // Must be owned by the correct person (check if ownedBy contains 'Client' or 'Spouse')
      const ownedBy = (asset.ownedBy || '').toString();
      if (willType === 'client') {
        // For Client's Will: include if Client is an owner
        if (!ownedBy.includes('Client')) return false;
      } else {
        // For Spouse's Will: include if Spouse is an owner
        if (!ownedBy.includes('Spouse')) return false;
      }

      // Exclude assets with beneficiary designations (pass outside probate)
      if (asset.has_bene === 'Yes') return false;

      // Exclude already assigned assets
      if (assignedIds.has(`${asset.idname}|${asset.id}`)) return false;

      return true;
    });
  }

  /**
   * Get asset key for dropdown value
   */
  getAssetKey(asset: Asset): string {
    return `${asset.idname}|${asset.id}`;
  }

  /**
   * Find asset by key (idname|id format)
   */
  findAssetByKey(key: string): Asset | null {
    if (!this.normalizedAssets || !key) return null;
    const [idname, id] = key.split('|');
    return this.normalizedAssets.all.find(a => a.idname === idname && String(a.id) === id) || null;
  }

  onAddSpecificDevise(willType: 'client' | 'spouse', assetKey: string): void {
    const asset = this.findAssetByKey(assetKey);
    if (asset) {
      this.addSpecificDevise(willType, asset);
    }
  }

  addSpecificDevise(willType: 'client' | 'spouse', asset: Asset): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;

    const ownedBy = (asset.ownedBy || '').toString();
    const isJointlyOwned = ownedBy.includes('Client') && ownedBy.includes('Spouse');

    // Create primary beneficiary - auto-populate spouse if jointly owned
    let primaryBene = createEmptyBeneficiaryDesignation();

    if (isJointlyOwned) {
      // For Client's Will, auto-populate Spouse as primary; for Spouse's Will, auto-populate Client
      const coOwner = willType === 'client' ? 'spouse' : 'client';
      const coOwnerFiduciary = this.fiduciaryPool.find(f => f.id === coOwner);
      if (coOwnerFiduciary) {
        primaryBene = {
          poolId: coOwnerFiduciary.id,
          name: coOwnerFiduciary.name,
          percentage: 100,
          perStirpes: false,
          isEntity: coOwnerFiduciary.isEntity || false
        };
      }
    }

    const devise: SpecificDevise = {
      id: this.generateId(),
      assetId: asset.id,
      assetIdname: asset.idname,
      assetName: asset.name,
      assetValue: Number(asset.approximate_value) || 0,
      description: '',
      primaryBeneficiary: primaryBene,
      alternateBeneficiary: createEmptyBeneficiaryDesignation(),
      isJointlyOwned: isJointlyOwned  // Flag for UI display
    };

    this.estatePlanService.addSpecificDevise(will, devise);
  }

  removeSpecificDevise(willType: 'client' | 'spouse', deviseId: string): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;
    this.estatePlanService.removeSpecificDevise(will, deviseId);
  }

  // ============ SPECIFIC BEQUESTS ============

  onAddSpecificBequest(willType: 'client' | 'spouse', assetKey: string): void {
    const asset = this.findAssetByKey(assetKey);
    if (asset) {
      this.addSpecificBequest(willType, asset);
    }
  }

  addSpecificBequest(willType: 'client' | 'spouse', asset: Asset): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;

    const ownedBy = (asset.ownedBy || '').toString();
    const isJointlyOwned = ownedBy.includes('Client') && ownedBy.includes('Spouse');

    // Create primary beneficiary - auto-populate spouse if jointly owned
    let primaryBene = createEmptyBeneficiaryDesignation();

    if (isJointlyOwned) {
      const coOwner = willType === 'client' ? 'spouse' : 'client';
      const coOwnerFiduciary = this.fiduciaryPool.find(f => f.id === coOwner);
      if (coOwnerFiduciary) {
        primaryBene = {
          poolId: coOwnerFiduciary.id,
          name: coOwnerFiduciary.name,
          percentage: 100,
          perStirpes: false,
          isEntity: coOwnerFiduciary.isEntity || false
        };
      }
    }

    const bequest: SpecificBequest = {
      id: this.generateId(),
      assetId: asset.id,
      assetIdname: asset.idname,
      assetName: asset.name,
      assetValue: Number(asset.approximate_value) || 0,
      description: '',
      primaryBeneficiary: primaryBene,
      alternateBeneficiary: createEmptyBeneficiaryDesignation(),
      isJointlyOwned: isJointlyOwned
    };

    this.estatePlanService.addSpecificBequest(will, bequest);
  }

  removeSpecificBequest(willType: 'client' | 'spouse', bequestId: string): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;
    this.estatePlanService.removeSpecificBequest(will, bequestId);
  }

  // ============ GENERAL BEQUESTS ============

  addGeneralBequest(willType: 'client' | 'spouse'): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;

    const bequest: GeneralBequest = {
      id: this.generateId(),
      amount: 0,
      description: '',
      primaryBeneficiary: createEmptyBeneficiaryDesignation(),
    };

    this.estatePlanService.addGeneralBequest(will, bequest);
  }

  removeGeneralBequest(willType: 'client' | 'spouse', bequestId: string): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;
    this.estatePlanService.removeGeneralBequest(will, bequestId);
  }

  // ============ RESIDUARY ============

  addResiduaryBeneficiary(willType: 'client' | 'spouse', tier: 'primary' | 'contingent'): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;

    const bene = createEmptyBeneficiaryDesignation();
    if (tier === 'primary') {
      will.residuary.primaryBeneficiaries.push(bene);
    } else {
      will.residuary.contingentBeneficiaries.push(bene);
    }
  }

  removeResiduaryBeneficiary(willType: 'client' | 'spouse', tier: 'primary' | 'contingent', index: number): void {
    const will = willType === 'client' ? this.clientWill : this.spouseWill;
    if (!will) return;

    if (tier === 'primary') {
      will.residuary.primaryBeneficiaries.splice(index, 1);
    } else {
      will.residuary.contingentBeneficiaries.splice(index, 1);
    }
  }

  getResiduaryTotal(will: Will, tier: 'primary' | 'contingent'): number {
    const benes = tier === 'primary' ? will.residuary.primaryBeneficiaries : will.residuary.contingentBeneficiaries;
    return benes.reduce((sum, b) => sum + (b.percentage || 0), 0);
  }

  // ============ VALIDATION HELPERS ============

  hasConflict(assetId: string | number, assetIdname: string): boolean {
    if (!this.validation) return false;
    return this.validation.conflicts.some(c => c.assetId === assetId && c.assetIdname === assetIdname);
  }

  getConflictMessage(assetId: string | number, assetIdname: string): string {
    if (!this.validation) return '';
    const conflict = this.validation.conflicts.find(c => c.assetId === assetId && c.assetIdname === assetIdname);
    return conflict?.message || '';
  }

  // ============ TRUST OPERATIONS ============

  get trusts(): Trust[] {
    return this.estatePlan?.trusts || [];
  }

  addNewTrust(): void {
    this.estatePlanService.createNewTrust();
  }

  removeTrust(trustId: string): void {
    if (confirm('Are you sure you want to remove this trust?')) {
      this.estatePlanService.removeTrust(trustId);
    }
  }

  // ============ POA OPERATIONS ============

  get clientPOA(): PowerOfAttorney | null {
    return this.estatePlan?.clientFinancialPOA || null;
  }

  get spousePOA(): PowerOfAttorney | null {
    return this.estatePlan?.spouseFinancialPOA || null;
  }

  initializeClientPOA(): void {
    this.estatePlanService.initializeClientPOA();
  }

  initializeSpousePOA(): void {
    this.estatePlanService.initializeSpousePOA();
  }

  // ============ HEALTHCARE OPERATIONS ============

  get clientHealthcare(): HealthcareDirective | null {
    return this.estatePlan?.clientHealthcarePOA || null;
  }

  get spouseHealthcare(): HealthcareDirective | null {
    return this.estatePlan?.spouseHealthcarePOA || null;
  }

  initializeClientHealthcare(): void {
    this.estatePlanService.initializeClientHealthcare();
  }

  initializeSpouseHealthcare(): void {
    this.estatePlanService.initializeSpouseHealthcare();
  }

  // ============ UTILITY ============

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // State abbreviations for dropdown
  states: string[] = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  relationshipTypes: string[] = [
    'Spouse', 'Child', 'Grandchild', 'Parent', 'Sibling',
    'Niece/Nephew', 'Friend', 'Attorney', 'Accountant',
    'Financial Advisor', 'Trust Company', 'Bank', 'Other'
  ];

  // ============ TEMPLATE HELPER METHODS ============

  /**
   * Toggle grantor (Client/Spouse) on a trust
   */
  toggleGrantor(trust: Trust, grantor: 'Client' | 'Spouse' | 'Both'): void {
    const index = trust.grantors.indexOf(grantor);
    if (index > -1) {
      trust.grantors.splice(index, 1);
    } else {
      trust.grantors.push(grantor);
    }
  }

  /**
   * Update beneficiary name when pool ID changes
   */
  updateBeneficiaryName(bene: BeneficiaryDesignation, poolId: string): void {
    const fiduciary = this.fiduciaryPool.find(f => f.id === poolId);
    bene.name = fiduciary?.name || '';
  }

  /**
   * Get fiduciary name by ID (for display)
   */
  getFiduciaryName(poolId: string): string {
    const fiduciary = this.fiduciaryPool.find(f => f.id === poolId);
    return fiduciary?.name || '';
  }
}
