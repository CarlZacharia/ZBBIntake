// planning.component.ts
import { Component, OnInit } from '@angular/core';
import { PlanningService } from '../../services/planning.service';
import { DataService } from '../../services/data.service';
import { NormalizedAssets, Asset } from '../../models/asset.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent implements OnInit {
  selectedAsset: any = null;
  normalized!: NormalizedAssets;
  showBeneficiaryModal = false;
  expandedAssets: Set<string> = new Set();

  get clientHeirs() {
    return this.dataService.getClientHeirsArray();
  }
  get spouseHeirs() {
    return this.dataService.getSpouseHeirsArray();
  }

  /** Toggle expanded state for an asset's beneficiary details */
  toggleBeneficiaryDetails(asset: Asset): void {
    const key = `${asset.idname}-${asset.id}`;
    if (this.expandedAssets.has(key)) {
      this.expandedAssets.delete(key);
    } else {
      this.expandedAssets.add(key);
    }
  }

  /** Check if an asset's beneficiary details are expanded */
  isExpanded(asset: Asset): boolean {
    const key = `${asset.idname}-${asset.id}`;
    return this.expandedAssets.has(key);
  }

  // ============ CLIENT ASSET FILTERS ============

  /** Client Probate: Sole ownership by Client, no beneficiary designation */
  get clientProbateAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) =>
        a.ownedBy === 'Client' &&
        a.ownershipForm === 'Sole' &&
        this.isNoBeneficiary(a.has_bene)
    );
  }

  /** Client Non-Probate: Sole ownership by Client, HAS beneficiary designation */
  get clientNonProbateAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) =>
        a.ownedBy === 'Client' &&
        a.ownershipForm === 'Sole' &&
        this.hasBeneficiary(a.has_bene)
    );
  }

  /** Client Joint with Spouse */
  get clientJointWithSpouseAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) => a.ownedBy === 'ClientAndSpouse'
    );
  }

  /** Client Joint with Spouse and Others */
  get clientJointWithSpouseAndOthersAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) => a.ownedBy === 'ClientSpouseAndOther'
    );
  }

  /** Client and Others (no spouse) */
  get clientAndOthersAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) => a.ownedBy === 'ClientAndOther'
    );
  }

  // ============ SPOUSE ASSET FILTERS ============

  /** Spouse Probate: Sole ownership by Spouse, no beneficiary designation */
  get spouseProbateAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) =>
        a.ownedBy === 'Spouse' &&
        a.ownershipForm === 'Sole' &&
        this.isNoBeneficiary(a.has_bene)
    );
  }

  /** Spouse Non-Probate: Sole ownership by Spouse, HAS beneficiary designation */
  get spouseNonProbateAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter(
      (a) =>
        a.ownedBy === 'Spouse' &&
        a.ownershipForm === 'Sole' &&
        this.hasBeneficiary(a.has_bene)
    );
  }

  /** Spouse Joint with Client (same as clientJointWithSpouse) */
  get spouseJointWithClientAssets(): Asset[] {
    return this.clientJointWithSpouseAssets;
  }

  /** Spouse Joint with Client and Others */
  get spouseJointWithClientAndOthersAssets(): Asset[] {
    return this.clientJointWithSpouseAndOthersAssets;
  }

  // ============ ENTITY ASSET FILTERS ============

  /** Trust-owned assets */
  get trustAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter((a) => a.ownedBy === 'Trust');
  }

  /** LLC-owned assets */
  get llcAssets(): Asset[] {
    if (!this.normalized?.all) return [];
    return this.normalized.all.filter((a) => a.ownedBy === 'LLC');
  }

  // ============ TOTALS ============

  get clientProbateTotal(): number {
    return this.sumValues(this.clientProbateAssets);
  }
  get clientNonProbateTotal(): number {
    return this.sumValues(this.clientNonProbateAssets);
  }
  get clientJointWithSpouseTotal(): number {
    return this.sumValues(this.clientJointWithSpouseAssets);
  }
  get clientJointWithSpouseAndOthersTotal(): number {
    return this.sumValues(this.clientJointWithSpouseAndOthersAssets);
  }
  get clientAndOthersTotal(): number {
    return this.sumValues(this.clientAndOthersAssets);
  }

  get spouseProbateTotal(): number {
    return this.sumValues(this.spouseProbateAssets);
  }
  get spouseNonProbateTotal(): number {
    return this.sumValues(this.spouseNonProbateAssets);
  }

  get trustTotal(): number {
    return this.sumValues(this.trustAssets);
  }
  get llcTotal(): number {
    return this.sumValues(this.llcAssets);
  }

  constructor(
    private dataService: DataService,
    private planningService: PlanningService
  ) {}

  ngOnInit(): void {
    const assets = this.dataService.assets();
    const normalizedInput = {
      realEstate: assets.real_estate_holdings ?? [],
      bank: assets.bank_account_holdings ?? [],
      nq: assets.nq_account_holdings ?? [],
      retirement: assets.retirement_account_holdings ?? [],
      lifeInsurance: assets.life_insurance_holdings ?? [],
      business: assets.business_interest_holdings ?? [],
      digital: assets.digital_asset_holdings ?? [],
      other: assets.other_asset_holdings ?? [],
    };
    this.normalized = this.planningService.normalizeAssets(normalizedInput);
  }

  // ============ HELPER METHODS ============

  /** Returns true if has_bene indicates NO beneficiary */
  private isNoBeneficiary(value: string | null | undefined): boolean {
    return value == null || value === '' || value === 'No';
  }

  /** Returns true if has_bene indicates a beneficiary IS designated */
  private hasBeneficiary(value: string | null | undefined): boolean {
    return value != null && value !== '' && value !== 'No';
  }

  /** Sum approximate_value for an array of assets */
  private sumValues(assets: Asset[]): number {
    return assets.reduce((sum, a) => sum + (Number(a.approximate_value) || 0), 0);
  }

  openBeneficiaryModal(asset: any) {
    this.selectedAsset = asset;
    this.showBeneficiaryModal = true;
  }

  getBeneficiaryLabel(value: string | null | undefined): string {
    return value == null || value === '' ? 'No' : value;
  }

  onSaveBeneficiaries(result: any) {
    console.log('Saved:', result);
    this.selectedAsset.beneficiaries = result;
    this.showBeneficiaryModal = false;
  }

  ownershipFormLabel(form: string | undefined): string {
    switch (form) {
      case 'TBE':
        return 'Tenants by the Entirety';
      case 'JTWROS':
        return 'Joint Tenants with Right of Survivorship';
      case 'TIC':
        return 'Tenants in Common';
      case 'Sole':
        return 'Sole Ownership';
      case 'Trust':
        return 'Trust';
      case 'LLC':
        return 'LLC';
      default:
        return form || '';
    }
  }

  categoryLabel(category: string | undefined): string {
    switch (category) {
      case 'RealEstate':
        return 'Real Estate';
      case 'Bank':
        return 'Bank Account';
      case 'NQ':
        return 'Non-Qualified Account';
      case 'Retirement':
        return 'Retirement Account';
      case 'LifeInsurance':
        return 'Life Insurance';
      case 'Business':
        return 'Business Interest';
      case 'Digital':
        return 'Digital Asset';
      case 'Other':
        return 'Other Asset';
      default:
        return category || '';
    }
  }
}
