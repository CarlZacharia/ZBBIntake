// planning-scenario.model.ts

export interface ScenarioAsset {
  // Original asset data
  id: number;
  idname: string;
  name: string;
  category: string;
  ownedBy: string;
  ownershipForm: string;
  has_bene: string | null;
  primary_beneficiaries: Beneficiary[];
  contingent_beneficiaries: Beneficiary[];
  percentOwned: number;  // defaults to 1 if null/undefined
  approximate_value: number;

  // Calculated scenario data
  calculatedValue: number;        // percentOwned * approximate_value (or portion going to this array)
  transferMechanism: TransferMechanism;
  inheritors: Inheritor[];
}

export interface Beneficiary {
  name: string;
  percentage: number;
}

export interface Inheritor {
  name: string;
  relationship: string;  // 'Spouse', 'Child', 'Other', 'Trust', 'Charity', etc.
  percentage: number;
  value: number;
}

export type TransferMechanism =
  | 'Probate'
  | 'Survivorship'
  | 'Beneficiary Designation'
  | 'Life Estate'
  | 'Lady Bird Deed'
  | 'Trust'
  | 'LLC'
  | 'Unaffected';

// Client Passes First Scenario
export interface ClientPassesFirstScenario {
  clientProbate: ScenarioAsset[];
  clientNonProbate: ScenarioAsset[];
  clientJointSpouse: ScenarioAsset[];
  clientJointOther: ScenarioAsset[];
  clientOther: ScenarioAsset[];
  spouseSole: ScenarioAsset[];
  trustAssets: ScenarioAsset[];
  llcAssets: ScenarioAsset[];

  // Totals
  clientProbateTotal: number;
  clientNonProbateTotal: number;
  clientJointSpouseTotal: number;
  clientJointOtherTotal: number;
  clientOtherTotal: number;
  spouseSoleTotal: number;
  trustAssetsTotal: number;
  llcAssetsTotal: number;
  grandTotal: number;
}

// Spouse Passes First Scenario (for future use)
export interface SpousePassesFirstScenario {
  spouseProbate: ScenarioAsset[];
  spouseNonProbate: ScenarioAsset[];
  spouseJointClient: ScenarioAsset[];
  spouseJointOther: ScenarioAsset[];
  spouseOther: ScenarioAsset[];
  clientSole: ScenarioAsset[];
  trustAssets: ScenarioAsset[];
  llcAssets: ScenarioAsset[];

  // Totals
  spouseProbateTotal: number;
  spouseNonProbateTotal: number;
  spouseJointClientTotal: number;
  spouseJointOtherTotal: number;
  spouseOtherTotal: number;
  clientSoleTotal: number;
  trustAssetsTotal: number;
  llcAssetsTotal: number;
  grandTotal: number;
}

// Both Deceased Scenario (for future use)
export interface BothDeceasedScenario {
  combinedProbate: ScenarioAsset[];
  combinedNonProbate: ScenarioAsset[];
  trustAssets: ScenarioAsset[];
  llcAssets: ScenarioAsset[];

  // Totals
  combinedProbateTotal: number;
  combinedNonProbateTotal: number;
  trustAssetsTotal: number;
  llcAssetsTotal: number;
  grandTotal: number;
}

// Master container for all scenarios
export interface PlanningScenarios {
  clientPassesFirst: ClientPassesFirstScenario | null;
  spousePassesFirst: SpousePassesFirstScenario | null;
  bothDeceased: BothDeceasedScenario | null;
}
