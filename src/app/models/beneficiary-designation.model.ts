// beneficiary-designation.model.ts
// Enhanced interfaces for beneficiary designation workflow

/**
 * Represents a selectable heir from the client or spouse heir arrays
 */
export interface ISelectableHeir {
  id: string;           // e.g., 'spouse', 'child_1', 'family_member_2', 'charity_3'
  name: string;
  type: 'Spouse' | 'Client' | 'Child' | 'FamilyMember' | 'Charity';
  selected: boolean;
  percentage: number;
  calculatedValue: number;
  perStirpes: boolean;
}

/**
 * Configuration for beneficiary designation on an asset
 */
export interface IBeneficiaryDesignation {
  // Structure choice
  hasSecondary: boolean;  // true = primary + secondary, false = primary only

  // Planning scenario
  scenario: 'client_dies_first' | 'spouse_dies_first' | null;

  // Primary beneficiaries
  primaryBeneficiaries: ISelectableHeir[];
  primaryDistribution: 'equal' | 'unequal';
  primaryTotalPercentage: number;

  // Secondary/Contingent beneficiaries
  secondaryBeneficiaries: ISelectableHeir[];
  secondaryDistribution: 'equal' | 'unequal';
  secondaryTotalPercentage: number;
}

/**
 * Available scenarios based on asset ownership
 */
export type OwnershipScenarioOptions = {
  showClientDiesFirst: boolean;
  showSpouseDiesFirst: boolean;
  requireScenarioChoice: boolean;
};

/**
 * Determines which scenarios to show based on owned_by value
 */
export function getScenarioOptions(ownedBy: string | null): OwnershipScenarioOptions {
  switch (ownedBy) {
    case 'Client':
      // Client owns it - only show client dies first scenario
      return {
        showClientDiesFirst: true,
        showSpouseDiesFirst: false,
        requireScenarioChoice: false
      };
    case 'Spouse':
      // Spouse owns it - only show spouse dies first scenario
      return {
        showClientDiesFirst: false,
        showSpouseDiesFirst: true,
        requireScenarioChoice: false
      };
    case 'Client & Spouse':
    case 'JTWROS':
    case 'TBE':
      // Joint ownership - show both scenarios
      return {
        showClientDiesFirst: true,
        showSpouseDiesFirst: true,
        requireScenarioChoice: true
      };
    default:
      // Trust, LLC, Other - default to client dies first
      return {
        showClientDiesFirst: true,
        showSpouseDiesFirst: false,
        requireScenarioChoice: false
      };
  }
}

/**
 * Helper to filter out selected primary beneficiaries from secondary list
 */
export function getAvailableSecondaryHeirs(
  allHeirs: ISelectableHeir[],
  primarySelected: ISelectableHeir[]
): ISelectableHeir[] {
  const primaryIds = new Set(primarySelected.filter(h => h.selected).map(h => h.id));
  return allHeirs.filter(h => !primaryIds.has(h.id));
}

/**
 * Validates that percentages sum to 100
 */
export function validatePercentages(beneficiaries: ISelectableHeir[]): {
  isValid: boolean;
  total: number;
  message: string;
} {
  const selected = beneficiaries.filter(b => b.selected);
  if (selected.length === 0) {
    return { isValid: false, total: 0, message: 'Select at least one beneficiary' };
  }

  const total = selected.reduce((sum, b) => sum + (b.percentage || 0), 0);

  if (Math.abs(total - 100) < 0.01) {
    return { isValid: true, total: 100, message: '' };
  }

  return {
    isValid: false,
    total,
    message: `Total is ${total.toFixed(2)}% - must equal 100%`
  };
}

/**
 * Calculates dollar values based on asset value and percentages
 */
export function calculateBeneficiaryValues(
  beneficiaries: ISelectableHeir[],
  assetValue: number
): ISelectableHeir[] {
  return beneficiaries.map(b => ({
    ...b,
    calculatedValue: b.selected ? (assetValue * (b.percentage / 100)) : 0
  }));
}

/**
 * Distributes percentages equally among selected beneficiaries
 */
export function distributeEqually(beneficiaries: ISelectableHeir[]): ISelectableHeir[] {
  const selected = beneficiaries.filter(b => b.selected);
  if (selected.length === 0) return beneficiaries;

  const equalShare = 100 / selected.length;

  return beneficiaries.map(b => ({
    ...b,
    percentage: b.selected ? equalShare : 0
  }));
}

/**
 * Converts heir array from DataService to ISelectableHeir array
 */
export function toSelectableHeirs(
  heirs: Array<{ id: string; name: string; type: string }>
): ISelectableHeir[] {
  return heirs.map(h => ({
    id: h.id,
    name: h.name,
    type: h.type as ISelectableHeir['type'],
    selected: false,
    percentage: 0,
    calculatedValue: 0,
    perStirpes: false
  }));
}

/**
 * Creates empty beneficiary designation
 */
export function createEmptyDesignation(): IBeneficiaryDesignation {
  return {
    hasSecondary: true,
    scenario: null,
    primaryBeneficiaries: [],
    primaryDistribution: 'equal',
    primaryTotalPercentage: 0,
    secondaryBeneficiaries: [],
    secondaryDistribution: 'equal',
    secondaryTotalPercentage: 0
  };
}

/**
 * Serializes designation for saving to asset
 */
export function serializeDesignation(designation: IBeneficiaryDesignation): {
  primary_beneficiaries: any[];
  contingent_beneficiaries: any[];
  scenario: string | null;
} {
  const mapBene = (b: ISelectableHeir) => ({
    beneficiary_id: null,
    heir_id: b.id,
    name: b.name,
    type: b.type,
    percentage: b.percentage,
    calculated_value: b.calculatedValue,
    per_stirpes: b.perStirpes
  });

  return {
    primary_beneficiaries: designation.primaryBeneficiaries
      .filter(b => b.selected)
      .map(mapBene),
    contingent_beneficiaries: designation.secondaryBeneficiaries
      .filter(b => b.selected)
      .map(mapBene),
    scenario: designation.scenario
  };
}
