// planning-scenario.service.ts
import { Injectable } from '@angular/core';
import {
  ScenarioAsset,
  Inheritor,
  TransferMechanism,
  ClientPassesFirstScenario,
  SpousePassesFirstScenario,
  BothDeceasedScenario,
  PlanningScenarios,
} from '../models/planning-scenario.model';
import { Asset, NormalizedAssets } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class PlanningScenarioService {
  // Store all scenario data
  private scenarios: PlanningScenarios = {
    clientPassesFirst: null,
    spousePassesFirst: null,
    bothDeceased: null,
  };

  // Spouse name for inheritor display (can be set from DataService)
  private spouseName: string = 'Spouse';
  private clientName: string = 'Client';

  constructor() {}

  // ============ GETTERS ============

  getClientPassesFirstScenario(): ClientPassesFirstScenario | null {
    return this.scenarios.clientPassesFirst;
  }

  getSpousePassesFirstScenario(): SpousePassesFirstScenario | null {
    return this.scenarios.spousePassesFirst;
  }

  getBothDeceasedScenario(): BothDeceasedScenario | null {
    return this.scenarios.bothDeceased;
  }

  getAllScenarios(): PlanningScenarios {
    return this.scenarios;
  }

  // ============ SETTERS ============

  setNames(clientName: string, spouseName: string): void {
    this.clientName = clientName || 'Client';
    this.spouseName = spouseName || 'Spouse';
  }

  // ============ SCENARIO GENERATORS ============

  /**
   * Generate Client Passes First scenario from normalized assets
   */
  generateClientPassesFirst(normalizedAssets: NormalizedAssets): ClientPassesFirstScenario {
    const scenario: ClientPassesFirstScenario = {
      clientProbate: [],
      clientNonProbate: [],
      clientJointSpouse: [],
      clientJointOther: [],
      clientOther: [],
      spouseSole: [],
      trustAssets: [],
      llcAssets: [],
      clientProbateTotal: 0,
      clientNonProbateTotal: 0,
      clientJointSpouseTotal: 0,
      clientJointOtherTotal: 0,
      clientOtherTotal: 0,
      spouseSoleTotal: 0,
      trustAssetsTotal: 0,
      llcAssetsTotal: 0,
      grandTotal: 0,
    };

    // Process all assets
    for (const asset of normalizedAssets.all) {
      this.routeAssetClientPassesFirst(asset, scenario);
    }

    // Calculate totals
    scenario.clientProbateTotal = this.sumCalculatedValues(scenario.clientProbate);
    scenario.clientNonProbateTotal = this.sumCalculatedValues(scenario.clientNonProbate);
    scenario.clientJointSpouseTotal = this.sumCalculatedValues(scenario.clientJointSpouse);
    scenario.clientJointOtherTotal = this.sumCalculatedValues(scenario.clientJointOther);
    scenario.clientOtherTotal = this.sumCalculatedValues(scenario.clientOther);
    scenario.spouseSoleTotal = this.sumCalculatedValues(scenario.spouseSole);
    scenario.trustAssetsTotal = this.sumCalculatedValues(scenario.trustAssets);
    scenario.llcAssetsTotal = this.sumCalculatedValues(scenario.llcAssets);
    scenario.grandTotal =
      scenario.clientProbateTotal +
      scenario.clientNonProbateTotal +
      scenario.clientJointSpouseTotal +
      scenario.clientJointOtherTotal +
      scenario.clientOtherTotal +
      scenario.spouseSoleTotal +
      scenario.trustAssetsTotal +
      scenario.llcAssetsTotal;

    // Store the scenario
    this.scenarios.clientPassesFirst = scenario;

    return scenario;
  }

  /**
   * Route a single asset for Client Passes First scenario
   */
  private routeAssetClientPassesFirst(asset: Asset, scenario: ClientPassesFirstScenario): void {
    const ownedBy = asset.ownedBy;
    const ownershipForm = asset.ownershipForm;
    const hasBene = asset.has_bene === 'Yes';
    const percentOwned = this.getPercentOwned(asset);
    const approxValue = Number(asset.approximate_value) || 0;

    // Trust-owned assets
    if (ownedBy === 'Trust') {
      scenario.trustAssets.push(
        this.createScenarioAsset(asset, approxValue, 'Trust', [
          { name: 'Trust Beneficiaries', relationship: 'Trust', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // LLC-owned assets
    if (ownedBy === 'LLC') {
      scenario.llcAssets.push(
        this.createScenarioAsset(asset, approxValue, 'LLC', [
          { name: 'LLC Members', relationship: 'LLC', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Spouse solely-owned assets (unaffected when client passes)
    if (ownedBy === 'Spouse') {
      scenario.spouseSole.push(
        this.createScenarioAsset(asset, approxValue, 'Unaffected', [
          { name: this.spouseName, relationship: 'Spouse', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Client solely-owned assets
    if (ownedBy === 'Client') {
      if (ownershipForm === 'Sole Ownership') {
        if (hasBene) {
          // Has beneficiary designation - Non-Probate
          scenario.clientNonProbate.push(
            this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, approxValue))
          );
        } else {
          // No beneficiary - Probate
          scenario.clientProbate.push(
            this.createScenarioAsset(asset, approxValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: 100, value: approxValue },
            ])
          );
        }
        return;
      }

      if (ownershipForm === 'TIC') {
        const clientValue = percentOwned * approxValue;
        if (hasBene) {
          // TIC with beneficiary - Client's share to Non-Probate
          scenario.clientNonProbate.push(
            this.createScenarioAsset(asset, clientValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, clientValue))
          );
        } else {
          // TIC without beneficiary - Client's share to Probate
          scenario.clientProbate.push(
            this.createScenarioAsset(asset, clientValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: clientValue },
            ])
          );
        }
        return;
      }

      if (ownershipForm === 'LifeEstate' || ownershipForm === 'LadyBird') {
        // Life Estate or Lady Bird Deed - passes to remainderman, Non-Probate
        const mechanism: TransferMechanism = ownershipForm === 'LifeEstate' ? 'Life Estate' : 'Lady Bird Deed';
        scenario.clientNonProbate.push(
          this.createScenarioAsset(asset, approxValue, mechanism, [
            { name: 'Remainderman', relationship: 'Designated', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      // Default for Client-owned assets with other/unknown ownership forms
      // Treat like sole ownership - probate or non-probate based on beneficiary
      if (hasBene) {
        scenario.clientNonProbate.push(
          this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, approxValue))
        );
      } else {
        scenario.clientProbate.push(
          this.createScenarioAsset(asset, approxValue, 'Probate', [
            { name: 'Estate/Heirs', relationship: 'Probate', percentage: 100, value: approxValue },
          ])
        );
      }
      return;
    }

    // Client and Spouse jointly-owned assets
    if (ownedBy === 'ClientAndSpouse') {
      if (ownershipForm === 'TBE' || ownershipForm === 'JTWROS') {
        // Tenants by Entirety or JTWROS - passes to spouse by survivorship
        scenario.clientJointSpouse.push(
          this.createScenarioAsset(asset, approxValue, 'Survivorship', [
            { name: this.spouseName, relationship: 'Spouse', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'TIC') {
        // Tenants in Common - Client's share to probate, Spouse's share stays with spouse
        const clientValue = percentOwned * approxValue;
        const spouseValue = (1 - percentOwned) * approxValue;

        // Client's share to probate
        scenario.clientProbate.push(
          this.createScenarioAsset(asset, clientValue, 'Probate', [
            { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: clientValue },
          ])
        );

        // Spouse's share remains with spouse
        scenario.spouseSole.push(
          this.createScenarioAsset(asset, spouseValue, 'Unaffected', [
            { name: this.spouseName, relationship: 'Spouse', percentage: (1 - percentOwned) * 100, value: spouseValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'LifeEstate' || ownershipForm === 'LadyBird') {
        // Joint Life Estate or Lady Bird - passes to spouse
        const mechanism: TransferMechanism = ownershipForm === 'LifeEstate' ? 'Life Estate' : 'Lady Bird Deed';
        scenario.clientJointSpouse.push(
          this.createScenarioAsset(asset, approxValue, mechanism, [
            { name: this.spouseName, relationship: 'Spouse', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      // Default for ClientAndSpouse with other/unknown ownership forms
      // Treat as survivorship - passes to spouse
      scenario.clientJointSpouse.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: this.spouseName, relationship: 'Spouse', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Client, Spouse, and Other jointly-owned assets
    if (ownedBy === 'ClientSpouseAndOther') {
      // When client passes, spouse survives - goes to clientJointSpouse
      scenario.clientJointSpouse.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: this.spouseName + ' & Other', relationship: 'Joint Owners', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Client and Other (non-spouse) jointly-owned assets
    if (ownedBy === 'ClientAndOther') {
      if (ownershipForm === 'JTWROS') {
        // JTWROS with other - full value passes to other by survivorship
        scenario.clientOther.push(
          this.createScenarioAsset(asset, approxValue, 'Survivorship', [
            { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'TIC') {
        // TIC with other - Client's share to probate, Other's share to clientOther
        const clientValue = percentOwned * approxValue;
        const otherValue = (1 - percentOwned) * approxValue;

        // Client's share to probate
        if (hasBene) {
          scenario.clientNonProbate.push(
            this.createScenarioAsset(asset, clientValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, clientValue))
          );
        } else {
          scenario.clientProbate.push(
            this.createScenarioAsset(asset, clientValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: clientValue },
            ])
          );
        }

        // Other's share stays with other
        scenario.clientOther.push(
          this.createScenarioAsset(asset, otherValue, 'Unaffected', [
            { name: 'Other Owner', relationship: 'Other', percentage: (1 - percentOwned) * 100, value: otherValue },
          ])
        );
        return;
      }

      // Default for ClientAndOther with other/unknown ownership forms
      // Treat as survivorship - passes to other
      scenario.clientOther.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // SpouseAndOther - unaffected when client passes
    if (ownedBy === 'SpouseAndOther') {
      scenario.spouseSole.push(
        this.createScenarioAsset(asset, approxValue, 'Unaffected', [
          { name: this.spouseName + ' & Other', relationship: 'Joint Owners', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Fallback - if we get here, add to probate with a note
    console.warn('Unhandled asset routing:', asset);
    scenario.clientProbate.push(
      this.createScenarioAsset(asset, approxValue, 'Probate', [
        { name: 'Unknown', relationship: 'Unknown', percentage: 100, value: approxValue },
      ])
    );
  }

  // ============ HELPER METHODS ============

  /**
   * Create a ScenarioAsset from an Asset
   */
  private createScenarioAsset(
    asset: Asset,
    calculatedValue: number,
    transferMechanism: TransferMechanism,
    inheritors: Inheritor[]
  ): ScenarioAsset {
    return {
      id: asset.id,
      idname: asset.idname,
      name: asset.name,
      category: asset.category,
      ownedBy: asset.ownedBy,
      ownershipForm: asset.ownershipForm,
      has_bene: asset.has_bene ?? null,
      primary_beneficiaries: asset.primary_beneficiaries ?? [],
      contingent_beneficiaries: asset.contingent_beneficiaries ?? [],
      percentOwned: this.getPercentOwned(asset),
      approximate_value: Number(asset.approximate_value) || 0,
      calculatedValue,
      transferMechanism,
      inheritors,
    };
  }

  /**
   * Get percent owned, defaulting to 1 (100%) if not specified
   */
  private getPercentOwned(asset: Asset): number {
    const percent = (asset as any).percentOwned ?? (asset as any).percent_owned ?? (asset as any).percentage_owned;
    if (percent == null || percent === '' || isNaN(Number(percent))) {
      return 1;
    }
    const numPercent = Number(percent);
    // If it's greater than 1, assume it's a percentage (e.g., 50 means 50%)
    return numPercent > 1 ? numPercent / 100 : numPercent;
  }

  /**
   * Create inheritors array from beneficiaries
   */
  private createInheritorsFromBeneficiaries(asset: Asset, totalValue: number): Inheritor[] {
    const inheritors: Inheritor[] = [];
    const beneficiaries = asset.primary_beneficiaries ?? [];

    if (beneficiaries.length === 0) {
      return [{ name: 'Designated Beneficiary', relationship: 'Beneficiary', percentage: 100, value: totalValue }];
    }

    for (const bene of beneficiaries) {
      const percentage = bene.percentage ?? (100 / beneficiaries.length);
      inheritors.push({
        name: bene.name,
        relationship: 'Beneficiary',
        percentage,
        value: (percentage / 100) * totalValue,
      });
    }

    return inheritors;
  }

  /**
   * Sum calculated values for an array of scenario assets
   */
  private sumCalculatedValues(assets: ScenarioAsset[]): number {
    return assets.reduce((sum, a) => sum + (a.calculatedValue || 0), 0);
  }

  // ============ FUTURE: SPOUSE PASSES FIRST ============

  generateSpousePassesFirst(normalizedAssets: NormalizedAssets): SpousePassesFirstScenario {
    // TODO: Implement similar logic with spouse/client roles reversed
    const scenario: SpousePassesFirstScenario = {
      spouseProbate: [],
      spouseNonProbate: [],
      spouseJointClient: [],
      spouseJointOther: [],
      spouseOther: [],
      clientSole: [],
      trustAssets: [],
      llcAssets: [],
      spouseProbateTotal: 0,
      spouseNonProbateTotal: 0,
      spouseJointClientTotal: 0,
      spouseJointOtherTotal: 0,
      spouseOtherTotal: 0,
      clientSoleTotal: 0,
      trustAssetsTotal: 0,
      llcAssetsTotal: 0,
      grandTotal: 0,
    };

    this.scenarios.spousePassesFirst = scenario;
    return scenario;
  }

  // ============ FUTURE: BOTH DECEASED ============

  generateBothDeceased(normalizedAssets: NormalizedAssets): BothDeceasedScenario {
    // TODO: Implement logic for when both have passed
    const scenario: BothDeceasedScenario = {
      combinedProbate: [],
      combinedNonProbate: [],
      trustAssets: [],
      llcAssets: [],
      combinedProbateTotal: 0,
      combinedNonProbateTotal: 0,
      trustAssetsTotal: 0,
      llcAssetsTotal: 0,
      grandTotal: 0,
    };

    this.scenarios.bothDeceased = scenario;
    return scenario;
  }

  /**
   * Clear all scenario data
   */
  clearScenarios(): void {
    this.scenarios = {
      clientPassesFirst: null,
      spousePassesFirst: null,
      bothDeceased: null,
    };
  }
}
