// estateplan.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
  EstatePlanWarning,
  createEmptyEstatePlan,
  createEmptyWill,
  createEmptyTrust,
  createEmptyPOA,
  createEmptyHealthcareDirective,
  createEmptyFiduciaryPoolMember,
} from '../models/estateplan.model';
import { Asset, NormalizedAssets } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class EstatePlanService {
  private readonly API_URL = 'https://zacbrownportal.com/api/estateplan.php';
  private readonly http = inject(HttpClient);

  private estatePlan: EstatePlan = createEmptyEstatePlan();
  private estatePlanSubject = new BehaviorSubject<EstatePlan>(this.estatePlan);

  // Observable for components to subscribe to
  estatePlan$ = this.estatePlanSubject.asObservable();

  // Current user ID for API calls
  private portalUserId: number | null = null;

  constructor() {}

  /**
   * Get current estate plan (synchronous)
   */
  getCurrentPlan(): EstatePlan {
    return this.estatePlan;
  }

  // ============ API METHODS ============

  /**
   * Set the portal user ID for API calls
   */
  setPortalUserId(id: number | null): void {
    this.portalUserId = id;
  }

  /**
   * Load estate plan from server
   */
  loadEstatePlan(portalUserId?: number): Observable<EstatePlan> {
    const userId = portalUserId || this.portalUserId;
    if (!userId) {
      return throwError(() => new Error('No portal_user_id set'));
    }

    return this.http.get<EstatePlan>(`${this.API_URL}?id=${userId}`).pipe(
      map((response) => {
        if (response) {
          this.estatePlan = response;
          this.estatePlanSubject.next(this.estatePlan);
        }
        return this.estatePlan;
      }),
      catchError((error) => {
        console.error('Failed to load estate plan:', error);
        // Return empty plan on error
        this.estatePlan = createEmptyEstatePlan();
        this.estatePlanSubject.next(this.estatePlan);
        return throwError(() => error);
      })
    );
  }

  /**
   * Save estate plan to server
   */
  saveEstatePlan(portalUserId?: number): Observable<any> {
    console.log('EP ', this.estatePlan);
    const userId = portalUserId || this.portalUserId;
    if (!userId) {
      return throwError(() => new Error('No portal_user_id set'));
    }

    return this.http.post(`${this.API_URL}?id=${userId}`, this.estatePlan).pipe(
      map((response) => {
        console.log('Estate plan saved:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Failed to save estate plan:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Auto-save with debounce
   */
  private saveTimeout?: any;

  private autoSave(): void {
    if (!this.portalUserId) return;

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveEstatePlan().subscribe({
        next: () => console.log('Estate plan auto-saved'),
        error: (err) => console.error('Auto-save failed:', err)
      });
    }, 2000);
  }

  // ============ GETTERS ============

  getEstatePlan(): EstatePlan {
    return this.estatePlan;
  }

  getClientWill(): Will | null {
    return this.estatePlan.clientWill;
  }

  getSpouseWill(): Will | null {
    return this.estatePlan.spouseWill;
  }

  getTrusts(): Trust[] {
    return this.estatePlan.trusts;
  }

  getTrustById(id: string): Trust | undefined {
    return this.estatePlan.trusts.find(t => t.id === id);
  }

  getFiduciaryPool(): FiduciaryPoolMember[] {
    return this.estatePlan.fiduciaryPool;
  }

  getFiduciaryById(id: string): FiduciaryPoolMember | undefined {
    return this.estatePlan.fiduciaryPool.find(f => f.id === id);
  }

  // ============ SETTERS / UPDATES ============

  setEstatePlan(plan: EstatePlan): void {
    this.estatePlan = plan;
    this.estatePlan.lastUpdated = new Date().toISOString();
    this.estatePlanSubject.next(this.estatePlan);
  }

  // ---- Will Operations ----

  setClientWill(will: Will | null): void {
    this.estatePlan.clientWill = will;
    this.updateTimestamp();
  }

  setSpouseWill(will: Will | null): void {
    this.estatePlan.spouseWill = will;
    this.updateTimestamp();
  }

  initializeClientWill(): Will {
    if (!this.estatePlan.clientWill) {
      this.estatePlan.clientWill = createEmptyWill('Client');
      this.updateTimestamp();
    }
    return this.estatePlan.clientWill;
  }

  initializeSpouseWill(): Will {
    if (!this.estatePlan.spouseWill) {
      this.estatePlan.spouseWill = createEmptyWill('Spouse');
      this.updateTimestamp();
    }
    return this.estatePlan.spouseWill;
  }

  // ---- Trust Operations ----

  addTrust(trust: Trust): void {
    this.estatePlan.trusts.push(trust);
    this.updateTimestamp();
  }

  updateTrust(trust: Trust): void {
    const index = this.estatePlan.trusts.findIndex(t => t.id === trust.id);
    if (index !== -1) {
      this.estatePlan.trusts[index] = trust;
      this.updateTimestamp();
    }
  }

  removeTrust(trustId: string): void {
    this.estatePlan.trusts = this.estatePlan.trusts.filter(t => t.id !== trustId);
    this.updateTimestamp();
  }

  createNewTrust(): Trust {
    const trust = createEmptyTrust();
    this.addTrust(trust);
    return trust;
  }

  // ---- POA Operations ----

  setClientPOA(poa: PowerOfAttorney | null): void {
    this.estatePlan.clientFinancialPOA = poa;
    this.updateTimestamp();
  }

  setSpousePOA(poa: PowerOfAttorney | null): void {
    this.estatePlan.spouseFinancialPOA = poa;
    this.updateTimestamp();
  }

  initializeClientPOA(): PowerOfAttorney {
    if (!this.estatePlan.clientFinancialPOA) {
      this.estatePlan.clientFinancialPOA = createEmptyPOA('Client');
      this.updateTimestamp();
    }
    return this.estatePlan.clientFinancialPOA;
  }

  initializeSpousePOA(): PowerOfAttorney {
    if (!this.estatePlan.spouseFinancialPOA) {
      this.estatePlan.spouseFinancialPOA = createEmptyPOA('Spouse');
      this.updateTimestamp();
    }
    return this.estatePlan.spouseFinancialPOA;
  }

  // ---- Healthcare Directive Operations ----

  setClientHealthcare(directive: HealthcareDirective | null): void {
    this.estatePlan.clientHealthcarePOA = directive;
    this.updateTimestamp();
  }

  setSpouseHealthcare(directive: HealthcareDirective | null): void {
    this.estatePlan.spouseHealthcarePOA = directive;
    this.updateTimestamp();
  }

  initializeClientHealthcare(): HealthcareDirective {
    if (!this.estatePlan.clientHealthcarePOA) {
      this.estatePlan.clientHealthcarePOA = createEmptyHealthcareDirective('Client');
      this.updateTimestamp();
    }
    return this.estatePlan.clientHealthcarePOA;
  }

  initializeSpouseHealthcare(): HealthcareDirective {
    if (!this.estatePlan.spouseHealthcarePOA) {
      this.estatePlan.spouseHealthcarePOA = createEmptyHealthcareDirective('Spouse');
      this.updateTimestamp();
    }
    return this.estatePlan.spouseHealthcarePOA;
  }

  // ---- Fiduciary Pool Operations ----

  addFiduciaryToPool(member: FiduciaryPoolMember): void {
    this.estatePlan.fiduciaryPool.push(member);
    this.updateTimestamp();
  }

  updateFiduciaryInPool(member: FiduciaryPoolMember): void {
    const index = this.estatePlan.fiduciaryPool.findIndex(f => f.id === member.id);
    if (index !== -1) {
      this.estatePlan.fiduciaryPool[index] = member;
      this.updateTimestamp();
    }
  }

  removeFiduciaryFromPool(memberId: string): void {
    this.estatePlan.fiduciaryPool = this.estatePlan.fiduciaryPool.filter(f => f.id !== memberId);
    this.updateTimestamp();
  }

  createNewFiduciary(): FiduciaryPoolMember {
    const member = createEmptyFiduciaryPoolMember();
    this.addFiduciaryToPool(member);
    return member;
  }

  // Create a FiduciaryReference from a pool member
  createFiduciaryReference(poolMember: FiduciaryPoolMember): FiduciaryReference {
    return {
      poolId: poolMember.id,
      name: poolMember.name,
      relationship: poolMember.relationship,
      isEntity: poolMember.isEntity,
    };
  }

  // ============ SPECIFIC DEVISE/BEQUEST OPERATIONS ============

  addSpecificDevise(will: Will, devise: SpecificDevise): void {
    will.specificDevises.push(devise);
    this.updateTimestamp();
  }

  updateSpecificDevise(will: Will, devise: SpecificDevise): void {
    const index = will.specificDevises.findIndex(d => d.id === devise.id);
    if (index !== -1) {
      will.specificDevises[index] = devise;
      this.updateTimestamp();
    }
  }

  removeSpecificDevise(will: Will, deviseId: string): void {
    will.specificDevises = will.specificDevises.filter(d => d.id !== deviseId);
    this.updateTimestamp();
  }

  addSpecificBequest(will: Will, bequest: SpecificBequest): void {
    will.specificBequests.push(bequest);
    this.updateTimestamp();
  }

  updateSpecificBequest(will: Will, bequest: SpecificBequest): void {
    const index = will.specificBequests.findIndex(b => b.id === bequest.id);
    if (index !== -1) {
      will.specificBequests[index] = bequest;
      this.updateTimestamp();
    }
  }

  removeSpecificBequest(will: Will, bequestId: string): void {
    will.specificBequests = will.specificBequests.filter(b => b.id !== bequestId);
    this.updateTimestamp();
  }

  addGeneralBequest(will: Will, bequest: GeneralBequest): void {
    will.generalBequests.push(bequest);
    this.updateTimestamp();
  }

  updateGeneralBequest(will: Will, bequest: GeneralBequest): void {
    const index = will.generalBequests.findIndex(b => b.id === bequest.id);
    if (index !== -1) {
      will.generalBequests[index] = bequest;
      this.updateTimestamp();
    }
  }

  removeGeneralBequest(will: Will, bequestId: string): void {
    will.generalBequests = will.generalBequests.filter(b => b.id !== bequestId);
    this.updateTimestamp();
  }

  // ============ VALIDATION ============

  /**
   * Validate the estate plan against assets
   * Checks for conflicts like assets with both beneficiary designations AND specific devises
   */
  validateEstatePlan(normalizedAssets: NormalizedAssets): EstatePlanValidation {
    const conflicts: EstatePlanConflict[] = [];
    const warnings: EstatePlanWarning[] = [];

    // Check Client Will
    if (this.estatePlan.clientWill) {
      this.validateWill(this.estatePlan.clientWill, normalizedAssets, conflicts, warnings, 'ClientWill');
    }

    // Check Spouse Will
    if (this.estatePlan.spouseWill) {
      this.validateWill(this.estatePlan.spouseWill, normalizedAssets, conflicts, warnings, 'SpouseWill');
    }

    // Check for missing documents
    if (!this.estatePlan.clientWill) {
      warnings.push({
        type: 'MissingExecutor',
        message: 'Client Will has not been created',
        documentType: 'ClientWill',
      });
    }

    if (!this.estatePlan.spouseWill) {
      warnings.push({
        type: 'MissingExecutor',
        message: 'Spouse Will has not been created',
        documentType: 'SpouseWill',
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      warnings,
    };
  }

  private validateWill(
    will: Will,
    normalizedAssets: NormalizedAssets,
    conflicts: EstatePlanConflict[],
    warnings: EstatePlanWarning[],
    documentType: 'ClientWill' | 'SpouseWill'
  ): void {
    // Check each specific devise for conflicts with beneficiary designations
    for (const devise of will.specificDevises) {
      const asset = normalizedAssets.all.find(
        a => a.id === devise.assetId && a.idname === devise.assetIdname
      );

      if (asset && asset.has_bene === 'Yes') {
        conflicts.push({
          type: 'BeneficiaryDeviseConflict',
          severity: 'warning',
          message: `"${devise.assetName}" has BOTH a beneficiary designation AND a specific devise in the Will. The beneficiary designation will typically take precedence for non-probate assets.`,
          assetId: devise.assetId,
          assetIdname: devise.assetIdname,
          assetName: devise.assetName,
        });
      }
    }

    // Check each specific bequest for conflicts
    for (const bequest of will.specificBequests) {
      const asset = normalizedAssets.all.find(
        a => a.id === bequest.assetId && a.idname === bequest.assetIdname
      );

      if (asset && asset.has_bene === 'Yes') {
        conflicts.push({
          type: 'BeneficiaryDeviseConflict',
          severity: 'warning',
          message: `"${bequest.assetName}" has BOTH a beneficiary designation AND a specific bequest in the Will. The beneficiary designation will typically take precedence for non-probate assets.`,
          assetId: bequest.assetId,
          assetIdname: bequest.assetIdname,
          assetName: bequest.assetName,
        });
      }
    }

    // Check for duplicate devises (same asset in multiple devises)
    const deviseAssetKeys = will.specificDevises.map(d => `${d.assetIdname}-${d.assetId}`);
    const duplicateDevises = deviseAssetKeys.filter((key, index) => deviseAssetKeys.indexOf(key) !== index);
    for (const dupeKey of duplicateDevises) {
      const devise = will.specificDevises.find(d => `${d.assetIdname}-${d.assetId}` === dupeKey);
      if (devise) {
        conflicts.push({
          type: 'DuplicateDevise',
          severity: 'error',
          message: `"${devise.assetName}" appears in multiple specific devises`,
          assetId: devise.assetId,
          assetIdname: devise.assetIdname,
          assetName: devise.assetName,
        });
      }
    }

    // Check residuary beneficiary percentages
    const primaryTotal = will.residuary.primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (will.residuary.primaryBeneficiaries.length > 0 && Math.abs(primaryTotal - 100) > 0.01) {
      warnings.push({
        type: 'PercentageNotComplete',
        message: `Primary residuary beneficiaries total ${primaryTotal}% (should be 100%)`,
        documentType,
      });
    }

    const contingentTotal = will.residuary.contingentBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (will.residuary.contingentBeneficiaries.length > 0 && Math.abs(contingentTotal - 100) > 0.01) {
      warnings.push({
        type: 'PercentageNotComplete',
        message: `Contingent residuary beneficiaries total ${contingentTotal}% (should be 100%)`,
        documentType,
      });
    }

    // Check for missing executor
    if (!will.executors.primary) {
      warnings.push({
        type: 'MissingExecutor',
        message: `${documentType === 'ClientWill' ? 'Client' : 'Spouse'} Will has no primary executor designated`,
        documentType,
      });
    }

    // Check for missing residuary beneficiaries
    if (will.residuary.primaryBeneficiaries.length === 0) {
      warnings.push({
        type: 'MissingResiduaryBeneficiary',
        message: `${documentType === 'ClientWill' ? 'Client' : 'Spouse'} Will has no residuary beneficiaries designated`,
        documentType,
      });
    }
  }

  /**
   * Get all assets that are available for specific devises/bequests
   * (Filters out assets already assigned to a devise/bequest in the given will)
   */
  getAvailableAssetsForWill(
    will: Will,
    normalizedAssets: NormalizedAssets,
    ownerFilter: 'Client' | 'Spouse'
  ): Asset[] {
    // Get assets owned by this person (or jointly)
    const ownedAssets = normalizedAssets.all.filter(a => {
      const ownedBy = a.ownedBy as string;
      if (ownerFilter === 'Client') {
        return ownedBy === 'Client' || ownedBy === 'ClientAndSpouse' || ownedBy === 'ClientAndOther' || ownedBy === 'ClientSpouseAndOther';
      } else {
        return ownedBy === 'Spouse' || ownedBy === 'ClientAndSpouse' || ownedBy === 'SpouseAndOther' || ownedBy === 'ClientSpouseAndOther';
      }
    });

    // Filter out assets already in specific devises or bequests
    const usedAssetKeys = new Set<string>();
    will.specificDevises.forEach(d => usedAssetKeys.add(`${d.assetIdname}-${d.assetId}`));
    will.specificBequests.forEach(b => usedAssetKeys.add(`${b.assetIdname}-${b.assetId}`));

    return ownedAssets.filter(a => !usedAssetKeys.has(`${a.idname}-${a.id}`));
  }

  /**
   * Check if a specific asset has a conflict (beneficiary designation + will provision)
   */
  checkAssetConflict(asset: Asset, will: Will): boolean {
    if (asset.has_bene !== 'Yes') return false;

    const assetKey = `${asset.idname}-${asset.id}`;
    const inDevise = will.specificDevises.some(d => `${d.assetIdname}-${d.assetId}` === assetKey);
    const inBequest = will.specificBequests.some(b => `${b.assetIdname}-${b.assetId}` === assetKey);

    return inDevise || inBequest;
  }

  // ============ PERSISTENCE ============

  private updateTimestamp(): void {
    this.estatePlan.lastUpdated = new Date().toISOString();
    this.estatePlanSubject.next(this.estatePlan);
    this.autoSave();
  }

  /**
   * Export estate plan as JSON string for saving to database
   */
  exportToJson(): string {
    return JSON.stringify(this.estatePlan);
  }

  /**
   * Import estate plan from JSON string (from database)
   */
  importFromJson(json: string): void {
    try {
      const plan = JSON.parse(json) as EstatePlan;
      this.setEstatePlan(plan);
    } catch (e) {
      console.error('Failed to parse estate plan JSON:', e);
    }
  }

  /**
   * Reset to empty estate plan
   */
  reset(): void {
    this.estatePlan = createEmptyEstatePlan();
    this.estatePlanSubject.next(this.estatePlan);
  }

  /**
   * Force save immediately (bypass auto-save delay)
   */
  forceSave(): Observable<any> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    return this.saveEstatePlan();
  }
}
