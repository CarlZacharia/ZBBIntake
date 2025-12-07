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
  HeirDistribution,
  HeirAsset,
} from '../models/planning.scenario.model';
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

  // Heirs for both deceased scenario
  private clientHeirs: Array<{ name: string; type: string }> = [];
  private spouseHeirs: Array<{ name: string; type: string }> = [];

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

  setHeirs(
    clientHeirs: Array<{ name: string; type: string }>,
    spouseHeirs: Array<{ name: string; type: string }>
  ): void {
    this.clientHeirs = clientHeirs || [];
    this.spouseHeirs = spouseHeirs || [];
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
    const ownedBy = asset.ownedBy as string;  // Cast to string for flexible comparison
    const ownershipForm = asset.ownershipForm as string;  // Cast to string for flexible comparison
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
      ownedBy: asset.ownedBy as string,
      ownershipForm: (asset.ownershipForm as string) || '',
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

  // ============ SPOUSE PASSES FIRST ============

  generateSpousePassesFirst(normalizedAssets: NormalizedAssets): SpousePassesFirstScenario {
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

    // Process all assets
    for (const asset of normalizedAssets.all) {
      this.routeAssetSpousePassesFirst(asset, scenario);
    }

    // Calculate totals
    scenario.spouseProbateTotal = this.sumCalculatedValues(scenario.spouseProbate);
    scenario.spouseNonProbateTotal = this.sumCalculatedValues(scenario.spouseNonProbate);
    scenario.spouseJointClientTotal = this.sumCalculatedValues(scenario.spouseJointClient);
    scenario.spouseJointOtherTotal = this.sumCalculatedValues(scenario.spouseJointOther);
    scenario.spouseOtherTotal = this.sumCalculatedValues(scenario.spouseOther);
    scenario.clientSoleTotal = this.sumCalculatedValues(scenario.clientSole);
    scenario.trustAssetsTotal = this.sumCalculatedValues(scenario.trustAssets);
    scenario.llcAssetsTotal = this.sumCalculatedValues(scenario.llcAssets);
    scenario.grandTotal =
      scenario.spouseProbateTotal +
      scenario.spouseNonProbateTotal +
      scenario.spouseJointClientTotal +
      scenario.spouseJointOtherTotal +
      scenario.spouseOtherTotal +
      scenario.clientSoleTotal +
      scenario.trustAssetsTotal +
      scenario.llcAssetsTotal;

    // Store the scenario
    this.scenarios.spousePassesFirst = scenario;

    return scenario;
  }

  /**
   * Route a single asset for Spouse Passes First scenario
   */
  private routeAssetSpousePassesFirst(asset: Asset, scenario: SpousePassesFirstScenario): void {
    const ownedBy = asset.ownedBy as string;
    const ownershipForm = asset.ownershipForm as string;
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

    // Client solely-owned assets (unaffected when spouse passes)
    if (ownedBy === 'Client') {
      scenario.clientSole.push(
        this.createScenarioAsset(asset, approxValue, 'Unaffected', [
          { name: this.clientName, relationship: 'Client', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Spouse solely-owned assets
    if (ownedBy === 'Spouse') {
      if (ownershipForm === 'Sole Ownership') {
        if (hasBene) {
          // Has beneficiary designation - Non-Probate
          scenario.spouseNonProbate.push(
            this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, approxValue))
          );
        } else {
          // No beneficiary - Probate
          scenario.spouseProbate.push(
            this.createScenarioAsset(asset, approxValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: 100, value: approxValue },
            ])
          );
        }
        return;
      }

      if (ownershipForm === 'TIC') {
        const spouseValue = percentOwned * approxValue;
        if (hasBene) {
          // TIC with beneficiary - Spouse's share to Non-Probate
          scenario.spouseNonProbate.push(
            this.createScenarioAsset(asset, spouseValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, spouseValue))
          );
        } else {
          // TIC without beneficiary - Spouse's share to Probate
          scenario.spouseProbate.push(
            this.createScenarioAsset(asset, spouseValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: spouseValue },
            ])
          );
        }
        return;
      }

      if (ownershipForm === 'LifeEstate' || ownershipForm === 'LadyBird') {
        // Life Estate or Lady Bird Deed - passes to remainderman, Non-Probate
        const mechanism: TransferMechanism = ownershipForm === 'LifeEstate' ? 'Life Estate' : 'Lady Bird Deed';
        scenario.spouseNonProbate.push(
          this.createScenarioAsset(asset, approxValue, mechanism, [
            { name: 'Remainderman', relationship: 'Designated', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      // Default for Spouse-owned assets with other/unknown ownership forms
      if (hasBene) {
        scenario.spouseNonProbate.push(
          this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, approxValue))
        );
      } else {
        scenario.spouseProbate.push(
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
        // Tenants by Entirety or JTWROS - passes to client by survivorship
        scenario.spouseJointClient.push(
          this.createScenarioAsset(asset, approxValue, 'Survivorship', [
            { name: this.clientName, relationship: 'Client', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'TIC') {
        // Tenants in Common - Spouse's share to probate, Client's share stays with client
        const spouseValue = percentOwned * approxValue;
        const clientValue = (1 - percentOwned) * approxValue;

        // Spouse's share to probate
        scenario.spouseProbate.push(
          this.createScenarioAsset(asset, spouseValue, 'Probate', [
            { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: spouseValue },
          ])
        );

        // Client's share remains with client
        scenario.clientSole.push(
          this.createScenarioAsset(asset, clientValue, 'Unaffected', [
            { name: this.clientName, relationship: 'Client', percentage: (1 - percentOwned) * 100, value: clientValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'LifeEstate' || ownershipForm === 'LadyBird') {
        // Joint Life Estate or Lady Bird - passes to client
        const mechanism: TransferMechanism = ownershipForm === 'LifeEstate' ? 'Life Estate' : 'Lady Bird Deed';
        scenario.spouseJointClient.push(
          this.createScenarioAsset(asset, approxValue, mechanism, [
            { name: this.clientName, relationship: 'Client', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      // Default for ClientAndSpouse with other/unknown ownership forms
      scenario.spouseJointClient.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: this.clientName, relationship: 'Client', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Client, Spouse, and Other jointly-owned assets
    if (ownedBy === 'ClientSpouseAndOther') {
      // When spouse passes, client survives - goes to spouseJointClient
      scenario.spouseJointClient.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: this.clientName + ' & Other', relationship: 'Joint Owners', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Spouse and Other (non-client) jointly-owned assets
    if (ownedBy === 'SpouseAndOther') {
      if (ownershipForm === 'JTWROS') {
        // JTWROS with other - full value passes to other by survivorship
        scenario.spouseOther.push(
          this.createScenarioAsset(asset, approxValue, 'Survivorship', [
            { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
          ])
        );
        return;
      }

      if (ownershipForm === 'TIC') {
        // TIC with other - Spouse's share to probate, Other's share to spouseOther
        const spouseValue = percentOwned * approxValue;
        const otherValue = (1 - percentOwned) * approxValue;

        // Spouse's share to probate
        if (hasBene) {
          scenario.spouseNonProbate.push(
            this.createScenarioAsset(asset, spouseValue, 'Beneficiary Designation',
              this.createInheritorsFromBeneficiaries(asset, spouseValue))
          );
        } else {
          scenario.spouseProbate.push(
            this.createScenarioAsset(asset, spouseValue, 'Probate', [
              { name: 'Estate/Heirs', relationship: 'Probate', percentage: percentOwned * 100, value: spouseValue },
            ])
          );
        }

        // Other's share stays with other
        scenario.spouseOther.push(
          this.createScenarioAsset(asset, otherValue, 'Unaffected', [
            { name: 'Other Owner', relationship: 'Other', percentage: (1 - percentOwned) * 100, value: otherValue },
          ])
        );
        return;
      }

      // Default for SpouseAndOther with other/unknown ownership forms
      scenario.spouseOther.push(
        this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // ClientAndOther - unaffected when spouse passes
    if (ownedBy === 'ClientAndOther') {
      scenario.clientSole.push(
        this.createScenarioAsset(asset, approxValue, 'Unaffected', [
          { name: this.clientName + ' & Other', relationship: 'Joint Owners', percentage: 100, value: approxValue },
        ])
      );
      return;
    }

    // Fallback - if we get here, add to probate with a note
    console.warn('Unhandled asset routing (Spouse First):', asset);
    scenario.spouseProbate.push(
      this.createScenarioAsset(asset, approxValue, 'Probate', [
        { name: 'Unknown', relationship: 'Unknown', percentage: 100, value: approxValue },
      ])
    );
  }

  // ============ BOTH DECEASED ============

  generateBothDeceased(normalizedAssets: NormalizedAssets): BothDeceasedScenario {
    const scenario: BothDeceasedScenario = {
      clientProbateAssets: [],
      spouseProbateAssets: [],
      beneficiaryDesignationAssets: [],
      otherJointOwnerAssets: [],
      trustAssets: [],
      llcAssets: [],
      heirDistributions: [],
      clientProbateTotal: 0,
      spouseProbateTotal: 0,
      beneficiaryDesignationTotal: 0,
      otherJointOwnerTotal: 0,
      trustAssetsTotal: 0,
      llcAssetsTotal: 0,
      grandTotal: 0,
    };

    // Map to aggregate heir distributions
    const heirMap = new Map<string, HeirDistribution>();

    // Process all assets
    for (const asset of normalizedAssets.all) {
      this.routeAssetBothDeceased(asset, scenario, heirMap);
    }

    // Convert heir map to array and sort by total value descending
    scenario.heirDistributions = Array.from(heirMap.values())
      .sort((a, b) => b.totalValue - a.totalValue);

    // Calculate totals
    scenario.clientProbateTotal = this.sumCalculatedValues(scenario.clientProbateAssets);
    scenario.spouseProbateTotal = this.sumCalculatedValues(scenario.spouseProbateAssets);
    scenario.beneficiaryDesignationTotal = this.sumCalculatedValues(scenario.beneficiaryDesignationAssets);
    scenario.otherJointOwnerTotal = this.sumCalculatedValues(scenario.otherJointOwnerAssets);
    scenario.trustAssetsTotal = this.sumCalculatedValues(scenario.trustAssets);
    scenario.llcAssetsTotal = this.sumCalculatedValues(scenario.llcAssets);
    scenario.grandTotal =
      scenario.clientProbateTotal +
      scenario.spouseProbateTotal +
      scenario.beneficiaryDesignationTotal +
      scenario.otherJointOwnerTotal +
      scenario.trustAssetsTotal +
      scenario.llcAssetsTotal;

    // Store the scenario
    this.scenarios.bothDeceased = scenario;

    return scenario;
  }

  /**
   * Route a single asset for Both Deceased scenario
   * Assumes Client passes first, then Spouse passes
   */
  private routeAssetBothDeceased(
    asset: Asset,
    scenario: BothDeceasedScenario,
    heirMap: Map<string, HeirDistribution>
  ): void {
    const ownedBy = asset.ownedBy as string;
    const ownershipForm = asset.ownershipForm as string;
    const hasBene = asset.has_bene === 'Yes';
    const percentOwned = this.getPercentOwned(asset);
    const approxValue = Number(asset.approximate_value) || 0;

    // Trust-owned assets
    if (ownedBy === 'Trust') {
      const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Trust', [
        { name: 'Trust Beneficiaries', relationship: 'Trust', percentage: 100, value: approxValue },
      ]);
      scenario.trustAssets.push(scenarioAsset);
      this.addToHeirMap(heirMap, 'Trust Beneficiaries', 'Trust', 'Both', asset, approxValue, 100, 'Trust');
      return;
    }

    // LLC-owned assets
    if (ownedBy === 'LLC') {
      const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'LLC', [
        { name: 'LLC Members', relationship: 'LLC', percentage: 100, value: approxValue },
      ]);
      scenario.llcAssets.push(scenarioAsset);
      this.addToHeirMap(heirMap, 'LLC Members', 'LLC', 'Both', asset, approxValue, 100, 'LLC');
      return;
    }

    // Client solely-owned assets
    if (ownedBy === 'Client') {
      if (hasBene) {
        // Has beneficiary designation - goes to beneficiaries
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
          this.createInheritorsFromBeneficiaries(asset, approxValue));
        scenario.beneficiaryDesignationAssets.push(scenarioAsset);
        this.distributeToBeneficiaries(heirMap, asset, approxValue, 'Client');
      } else {
        // No beneficiary - goes through Client's probate to Client's heirs
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Probate',
          this.createInheritorsFromHeirs(this.clientHeirs, approxValue));
        scenario.clientProbateAssets.push(scenarioAsset);
        this.distributeToHeirs(heirMap, this.clientHeirs, asset, approxValue, 'Client');
      }
      return;
    }

    // Spouse solely-owned assets
    if (ownedBy === 'Spouse') {
      if (hasBene) {
        // Has beneficiary designation - goes to beneficiaries
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
          this.createInheritorsFromBeneficiaries(asset, approxValue));
        scenario.beneficiaryDesignationAssets.push(scenarioAsset);
        this.distributeToBeneficiaries(heirMap, asset, approxValue, 'Spouse');
      } else {
        // No beneficiary - goes through Spouse's probate to Spouse's heirs
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Probate',
          this.createInheritorsFromHeirs(this.spouseHeirs, approxValue));
        scenario.spouseProbateAssets.push(scenarioAsset);
        this.distributeToHeirs(heirMap, this.spouseHeirs, asset, approxValue, 'Spouse');
      }
      return;
    }

    // Client and Spouse jointly-owned assets
    if (ownedBy === 'ClientAndSpouse') {
      if (ownershipForm === 'TBE' || ownershipForm === 'JTWROS') {
        // Client dies first → Spouse inherits → Spouse dies → Spouse's estate/beneficiaries
        // Check if asset has beneficiary designation (spouse may have named beneficiaries)
        if (hasBene) {
          const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, approxValue));
          scenario.beneficiaryDesignationAssets.push(scenarioAsset);
          this.distributeToBeneficiaries(heirMap, asset, approxValue, 'ClientAndSpouse');
        } else {
          // Goes through Spouse's probate
          const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Probate',
            this.createInheritorsFromHeirs(this.spouseHeirs, approxValue));
          scenario.spouseProbateAssets.push(scenarioAsset);
          this.distributeToHeirs(heirMap, this.spouseHeirs, asset, approxValue, 'ClientAndSpouse');
        }
        return;
      }

      if (ownershipForm === 'TIC') {
        // Tenants in Common - each share goes through respective probate
        const clientValue = percentOwned * approxValue;
        const spouseValue = (1 - percentOwned) * approxValue;

        // Client's share
        if (hasBene) {
          const clientAsset = this.createScenarioAsset(asset, clientValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, clientValue));
          scenario.beneficiaryDesignationAssets.push(clientAsset);
          this.distributeToBeneficiaries(heirMap, asset, clientValue, 'Client');
        } else {
          const clientAsset = this.createScenarioAsset(asset, clientValue, 'Probate',
            this.createInheritorsFromHeirs(this.clientHeirs, clientValue));
          scenario.clientProbateAssets.push(clientAsset);
          this.distributeToHeirs(heirMap, this.clientHeirs, asset, clientValue, 'Client');
        }

        // Spouse's share - goes through spouse's probate
        const spouseAsset = this.createScenarioAsset(asset, spouseValue, 'Probate',
          this.createInheritorsFromHeirs(this.spouseHeirs, spouseValue));
        scenario.spouseProbateAssets.push(spouseAsset);
        this.distributeToHeirs(heirMap, this.spouseHeirs, asset, spouseValue, 'Spouse');
        return;
      }

      // Default for ClientAndSpouse - treat as survivorship to spouse then spouse's estate
      if (hasBene) {
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Beneficiary Designation',
          this.createInheritorsFromBeneficiaries(asset, approxValue));
        scenario.beneficiaryDesignationAssets.push(scenarioAsset);
        this.distributeToBeneficiaries(heirMap, asset, approxValue, 'ClientAndSpouse');
      } else {
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Probate',
          this.createInheritorsFromHeirs(this.spouseHeirs, approxValue));
        scenario.spouseProbateAssets.push(scenarioAsset);
        this.distributeToHeirs(heirMap, this.spouseHeirs, asset, approxValue, 'ClientAndSpouse');
      }
      return;
    }

    // Client, Spouse, and Other jointly-owned assets
    if (ownedBy === 'ClientSpouseAndOther') {
      // Client dies → Spouse & Other own → Spouse dies → Other owns by survivorship
      const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Survivorship', [
        { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
      ]);
      scenario.otherJointOwnerAssets.push(scenarioAsset);
      this.addToHeirMap(heirMap, 'Other Joint Owner', 'Joint Owner', 'Joint Owner', asset, approxValue, 100, 'ClientSpouseAndOther');
      return;
    }

    // Client and Other (non-spouse) jointly-owned assets
    if (ownedBy === 'ClientAndOther') {
      if (ownershipForm === 'JTWROS') {
        // Client dies → Other owns by survivorship
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
        ]);
        scenario.otherJointOwnerAssets.push(scenarioAsset);
        this.addToHeirMap(heirMap, 'Other Joint Owner', 'Joint Owner', 'Joint Owner', asset, approxValue, 100, 'Client');
        return;
      }

      if (ownershipForm === 'TIC') {
        // Client's share goes to client's estate, Other keeps their share
        const clientValue = percentOwned * approxValue;
        const otherValue = (1 - percentOwned) * approxValue;

        // Client's share
        if (hasBene) {
          const clientAsset = this.createScenarioAsset(asset, clientValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, clientValue));
          scenario.beneficiaryDesignationAssets.push(clientAsset);
          this.distributeToBeneficiaries(heirMap, asset, clientValue, 'Client');
        } else {
          const clientAsset = this.createScenarioAsset(asset, clientValue, 'Probate',
            this.createInheritorsFromHeirs(this.clientHeirs, clientValue));
          scenario.clientProbateAssets.push(clientAsset);
          this.distributeToHeirs(heirMap, this.clientHeirs, asset, clientValue, 'Client');
        }

        // Other's share
        const otherAsset = this.createScenarioAsset(asset, otherValue, 'Unaffected', [
          { name: 'Other Owner', relationship: 'Other', percentage: (1 - percentOwned) * 100, value: otherValue },
        ]);
        scenario.otherJointOwnerAssets.push(otherAsset);
        this.addToHeirMap(heirMap, 'Other Owner', 'Joint Owner', 'Joint Owner', asset, otherValue, (1 - percentOwned) * 100, 'Client');
        return;
      }

      // Default - treat as survivorship
      const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Survivorship', [
        { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
      ]);
      scenario.otherJointOwnerAssets.push(scenarioAsset);
      this.addToHeirMap(heirMap, 'Other Joint Owner', 'Joint Owner', 'Joint Owner', asset, approxValue, 100, 'Client');
      return;
    }

    // Spouse and Other jointly-owned assets
    if (ownedBy === 'SpouseAndOther') {
      if (ownershipForm === 'JTWROS') {
        // Spouse dies → Other owns by survivorship
        const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Survivorship', [
          { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
        ]);
        scenario.otherJointOwnerAssets.push(scenarioAsset);
        this.addToHeirMap(heirMap, 'Other Joint Owner', 'Joint Owner', 'Joint Owner', asset, approxValue, 100, 'Spouse');
        return;
      }

      if (ownershipForm === 'TIC') {
        // Spouse's share goes to spouse's estate, Other keeps their share
        const spouseValue = percentOwned * approxValue;
        const otherValue = (1 - percentOwned) * approxValue;

        // Spouse's share
        if (hasBene) {
          const spouseAsset = this.createScenarioAsset(asset, spouseValue, 'Beneficiary Designation',
            this.createInheritorsFromBeneficiaries(asset, spouseValue));
          scenario.beneficiaryDesignationAssets.push(spouseAsset);
          this.distributeToBeneficiaries(heirMap, asset, spouseValue, 'Spouse');
        } else {
          const spouseAsset = this.createScenarioAsset(asset, spouseValue, 'Probate',
            this.createInheritorsFromHeirs(this.spouseHeirs, spouseValue));
          scenario.spouseProbateAssets.push(spouseAsset);
          this.distributeToHeirs(heirMap, this.spouseHeirs, asset, spouseValue, 'Spouse');
        }

        // Other's share
        const otherAsset = this.createScenarioAsset(asset, otherValue, 'Unaffected', [
          { name: 'Other Owner', relationship: 'Other', percentage: (1 - percentOwned) * 100, value: otherValue },
        ]);
        scenario.otherJointOwnerAssets.push(otherAsset);
        this.addToHeirMap(heirMap, 'Other Owner', 'Joint Owner', 'Joint Owner', asset, otherValue, (1 - percentOwned) * 100, 'Spouse');
        return;
      }

      // Default - treat as survivorship
      const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Survivorship', [
        { name: 'Other Joint Owner', relationship: 'Other', percentage: 100, value: approxValue },
      ]);
      scenario.otherJointOwnerAssets.push(scenarioAsset);
      this.addToHeirMap(heirMap, 'Other Joint Owner', 'Joint Owner', 'Joint Owner', asset, approxValue, 100, 'Spouse');
      return;
    }

    // Fallback - if we get here, add to client probate with a note
    console.warn('Unhandled asset routing (Both Deceased):', asset);
    const scenarioAsset = this.createScenarioAsset(asset, approxValue, 'Probate', [
      { name: 'Unknown', relationship: 'Unknown', percentage: 100, value: approxValue },
    ]);
    scenario.clientProbateAssets.push(scenarioAsset);
    this.addToHeirMap(heirMap, 'Unknown', 'Unknown', 'Both', asset, approxValue, 100, 'Unknown');
  }

  // ============ HEIR DISTRIBUTION HELPERS ============

  /**
   * Add an asset to an heir's distribution
   */
  private addToHeirMap(
    heirMap: Map<string, HeirDistribution>,
    heirName: string,
    relationship: string,
    source: 'Client' | 'Spouse' | 'Both' | 'Beneficiary' | 'Joint Owner',
    asset: Asset,
    value: number,
    percentage: number,
    originalOwner: string
  ): void {
    const key = heirName;

    if (!heirMap.has(key)) {
      heirMap.set(key, {
        name: heirName,
        relationship,
        source,
        assets: [],
        totalValue: 0,
      });
    }

    const heir = heirMap.get(key)!;
    heir.assets.push({
      assetId: asset.id,
      assetIdname: asset.idname,
      assetName: asset.name,
      category: asset.category,
      transferMechanism: 'Probate', // Will be updated based on actual mechanism
      percentage,
      value,
      originalOwner,
    });
    heir.totalValue += value;
  }

  /**
   * Distribute an asset to designated beneficiaries
   */
  private distributeToBeneficiaries(
    heirMap: Map<string, HeirDistribution>,
    asset: Asset,
    totalValue: number,
    originalOwner: string
  ): void {
    const beneficiaries = asset.primary_beneficiaries ?? [];

    if (beneficiaries.length === 0) {
      // No specific beneficiaries listed - use generic
      this.addToHeirMap(heirMap, 'Designated Beneficiary', 'Beneficiary', 'Beneficiary', asset, totalValue, 100, originalOwner);
      return;
    }

    for (const bene of beneficiaries) {
      const percentage = bene.percentage ?? (100 / beneficiaries.length);
      const value = (percentage / 100) * totalValue;
      this.addToHeirMap(heirMap, bene.name, 'Beneficiary', 'Beneficiary', asset, value, percentage, originalOwner);
    }
  }

  /**
   * Distribute an asset to heirs (for probate)
   */
  private distributeToHeirs(
    heirMap: Map<string, HeirDistribution>,
    heirs: Array<{ name: string; type: string }>,
    asset: Asset,
    totalValue: number,
    originalOwner: string
  ): void {
    if (heirs.length === 0) {
      // No heirs listed - use generic "Estate/Heirs"
      const heirName = originalOwner === 'Client' ? `${this.clientName}'s Estate` : `${this.spouseName}'s Estate`;
      this.addToHeirMap(heirMap, heirName, 'Estate', originalOwner === 'Client' ? 'Client' : 'Spouse', asset, totalValue, 100, originalOwner);
      return;
    }

    // Distribute equally among heirs (simplified - could be more complex based on will)
    const sharePerHeir = totalValue / heirs.length;
    const percentPerHeir = 100 / heirs.length;

    for (const heir of heirs) {
      this.addToHeirMap(heirMap, heir.name, heir.type, originalOwner === 'Client' ? 'Client' : 'Spouse', asset, sharePerHeir, percentPerHeir, originalOwner);
    }
  }

  /**
   * Create inheritors array from heirs
   */
  private createInheritorsFromHeirs(heirs: Array<{ name: string; type: string }>, totalValue: number): Inheritor[] {
    if (heirs.length === 0) {
      return [{ name: 'Estate/Heirs', relationship: 'Probate', percentage: 100, value: totalValue }];
    }

    const sharePerHeir = totalValue / heirs.length;
    const percentPerHeir = 100 / heirs.length;

    return heirs.map(heir => ({
      name: heir.name,
      relationship: heir.type,
      percentage: percentPerHeir,
      value: sharePerHeir,
    }));
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
