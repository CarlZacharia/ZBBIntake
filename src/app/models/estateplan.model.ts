// estateplan.model.ts
// Master model for estate planning documents (stored as JSON blob)

// ============ MASTER ESTATE PLAN ============

export interface EstatePlan {
  lastUpdated?: string;

  // Wills
  clientWill: Will | null;
  spouseWill: Will | null;

  // Trusts (can have multiple)
  trusts: Trust[];

  // Powers of Attorney - Financial
  clientFinancialPOA: PowerOfAttorney | null;
  spouseFinancialPOA: PowerOfAttorney | null;

  // Healthcare Documents
  clientHealthcarePOA: HealthcareDirective | null;
  spouseHealthcarePOA: HealthcareDirective | null;

  // Master list of people who can be fiduciaries/beneficiaries
  fiduciaryPool: FiduciaryPoolMember[];
}

// ============ FIDUCIARY POOL ============
// Master list of people who can be selected as executors, trustees, agents, etc.

export interface FiduciaryPoolMember {
  id: string;
  name: string;
  relationship?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  isEntity: boolean;
  entityType?: 'Trust' | 'Bank' | 'Corporation' | 'LawFirm' | 'Charity' | 'Other';
  notes?: string;
}

// ============ SHARED INTERFACES ============

// Reusable for Executors, Trustees, Agents - references fiduciaryPool by ID
export interface FiduciaryDesignation {
  primary: FiduciaryReference | null;
  secondary: FiduciaryReference | null;
  tertiary: FiduciaryReference | null;
}

export interface FiduciaryReference {
  poolId: string;           // References FiduciaryPoolMember.id
  name: string;             // Denormalized for display
  relationship?: string;    // Denormalized for display
  isEntity: boolean;        // Denormalized for display
}

// Reusable for any beneficiary in Will, Trust, etc.
export interface BeneficiaryDesignation {
  poolId?: string;          // Optional reference to fiduciaryPool
  name: string;
  relationship?: string;
  percentage: number;
  isEntity: boolean;
  entityType?: 'Trust' | 'Charity' | 'Corporation' | 'Other';
  perStirpes: boolean;      // If false, assume per capita
}

// ============ WILL ============

export interface Will {
  testator: 'Client' | 'Spouse';
  state?: string;

  executors: FiduciaryDesignation;

  // Linked to assets in system (required link)
  specificDevises: SpecificDevise[];      // Real property
  specificBequests: SpecificBequest[];    // Tangible personal property
  generalBequests: GeneralBequest[];      // Cash amounts

  residuary: ResiduaryProvision;

  // Optional notes/special provisions
  notes?: string;
}

export interface SpecificDevise {
  id: string;

  // Asset link (required)
  assetId: string | number;
  assetIdname: string;
  assetName: string;            // Denormalized for display
  assetValue?: number;          // Denormalized for display

  description?: string;         // Additional description
  primaryBeneficiary: BeneficiaryDesignation;
  alternateBeneficiary?: BeneficiaryDesignation;
  isJointlyOwned?: boolean;     // Flag if property is owned with spouse
}

export interface SpecificBequest {
  id: string;

  // Asset link (required)
  assetId: string | number;
  assetIdname: string;
  assetName: string;
  assetValue?: number;

  description?: string;
  primaryBeneficiary: BeneficiaryDesignation;
  alternateBeneficiary?: BeneficiaryDesignation;
  isJointlyOwned?: boolean;     // Flag if property is owned with spouse
}

export interface GeneralBequest {
  id: string;
  amount: number;
  description?: string;         // Purpose or note
  primaryBeneficiary: BeneficiaryDesignation;
  alternateBeneficiary?: BeneficiaryDesignation;
}

export interface ResiduaryProvision {
  distributionMethod: 'perStirpes' | 'perCapita';
  primaryBeneficiaries: BeneficiaryDesignation[];       // Must total 100%
  contingentBeneficiaries: BeneficiaryDesignation[];    // If all primary predecease
}

// ============ TRUST ============

export interface Trust {
  id: string;
  name: string;
  type: TrustType;
  state?: string;

  grantors: ('Client' | 'Spouse' | 'Both')[];

  trustees: FiduciaryDesignation;

  // Trust beneficiaries (income/principal during trust term)
  beneficiaries: TrustBeneficiary[];

  // Remainder beneficiaries (after trust terminates)
  remainderBeneficiaries: BeneficiaryDesignation[];

  notes?: string;
}

export type TrustType =
  | 'Revocable'
  | 'Irrevocable'
  | 'Testamentary'
  | 'SpecialNeeds'
  | 'ILIT'           // Irrevocable Life Insurance Trust
  | 'QPRT'           // Qualified Personal Residence Trust
  | 'GRAT'           // Grantor Retained Annuity Trust
  | 'CRT'            // Charitable Remainder Trust
  | 'CLT'            // Charitable Lead Trust
  | 'SLAT'           // Spousal Lifetime Access Trust
  | 'Other';

export interface TrustBeneficiary {
  poolId?: string;
  name: string;
  relationship?: string;
  benefitType: 'Income' | 'Principal' | 'Both' | 'Discretionary';
  isEntity: boolean;
  entityType?: 'Trust' | 'Charity' | 'Other';
}

// ============ POWER OF ATTORNEY ============

export interface PowerOfAttorney {
  principal: 'Client' | 'Spouse';
  type: 'Durable' | 'Springing' | 'Limited';
  state?: string;

  agents: FiduciaryDesignation;

  // Specific powers or limitations
  giftingAuthority?: boolean;
  realEstateAuthority?: boolean;
  retirementAccountAuthority?: boolean;

  notes?: string;
}

// ============ HEALTHCARE DIRECTIVE ============

export interface HealthcareDirective {
  principal: 'Client' | 'Spouse';
  state?: string;

  surrogates: FiduciaryDesignation;     // Healthcare agents/proxies

  // Living will preferences
  livingWillProvisions?: LivingWillProvisions;

  // HIPAA authorization
  hipaaAuthorized?: FiduciaryReference[];

  notes?: string;
}

export interface LivingWillProvisions {
  terminalCondition?: 'WithholdLifeSupport' | 'ContinueLifeSupport' | 'NotSpecified';
  permanentUnconscious?: 'WithholdLifeSupport' | 'ContinueLifeSupport' | 'NotSpecified';
  endStageCondition?: 'WithholdLifeSupport' | 'ContinueLifeSupport' | 'NotSpecified';

  // Optional specific preferences
  artificialNutrition?: 'Withhold' | 'Continue' | 'NotSpecified';
  painManagement?: 'AggressivePainRelief' | 'Standard' | 'NotSpecified';
  organDonation?: 'Yes' | 'No' | 'Limited' | 'NotSpecified';
  organDonationNotes?: string;
}

// ============ VALIDATION TYPES ============

export interface EstatePlanValidation {
  hasConflicts: boolean;
  conflicts: EstatePlanConflict[];
  warnings: EstatePlanWarning[];
}

export interface EstatePlanConflict {
  type: 'BeneficiaryDeviseConflict' | 'DuplicateDevise' | 'PercentageError';
  severity: 'error' | 'warning';
  message: string;
  assetId?: string | number;
  assetIdname?: string;
  assetName?: string;
}

export interface EstatePlanWarning {
  type: 'MissingExecutor' | 'MissingResiduaryBeneficiary' | 'PercentageNotComplete' | 'OutdatedDocument';
  message: string;
  documentType?: 'ClientWill' | 'SpouseWill' | 'Trust' | 'POA' | 'Healthcare';
}

// ============ FACTORY FUNCTIONS ============

export function createEmptyEstatePlan(): EstatePlan {
  return {
    lastUpdated: new Date().toISOString(),
    clientWill: null,
    spouseWill: null,
    trusts: [],
    clientFinancialPOA: null,
    spouseFinancialPOA: null,
    clientHealthcarePOA: null,
    spouseHealthcarePOA: null,
    fiduciaryPool: [],
  };
}

export function createEmptyWill(testator: 'Client' | 'Spouse'): Will {
  return {
    testator,
    state: undefined,
    executors: {
      primary: null,
      secondary: null,
      tertiary: null,
    },
    specificDevises: [],
    specificBequests: [],
    generalBequests: [],
    residuary: {
      distributionMethod: 'perStirpes',
      primaryBeneficiaries: [],
      contingentBeneficiaries: [],
    },
    notes: undefined,
  };
}

export function createEmptyTrust(): Trust {
  return {
    id: generateId(),
    name: '',
    type: 'Revocable',
    state: undefined,
    grantors: [],
    trustees: {
      primary: null,
      secondary: null,
      tertiary: null,
    },
    beneficiaries: [],
    remainderBeneficiaries: [],
    notes: undefined,
  };
}

export function createEmptyPOA(principal: 'Client' | 'Spouse'): PowerOfAttorney {
  return {
    principal,
    type: 'Durable',
    state: undefined,
    agents: {
      primary: null,
      secondary: null,
      tertiary: null,
    },
    giftingAuthority: false,
    realEstateAuthority: true,
    retirementAccountAuthority: true,
    notes: undefined,
  };
}

export function createEmptyHealthcareDirective(principal: 'Client' | 'Spouse'): HealthcareDirective {
  return {
    principal,
    state: undefined,
    surrogates: {
      primary: null,
      secondary: null,
      tertiary: null,
    },
    livingWillProvisions: {
      terminalCondition: 'NotSpecified',
      permanentUnconscious: 'NotSpecified',
      endStageCondition: 'NotSpecified',
      artificialNutrition: 'NotSpecified',
      painManagement: 'NotSpecified',
      organDonation: 'NotSpecified',
    },
    hipaaAuthorized: [],
    notes: undefined,
  };
}

export function createEmptyFiduciaryPoolMember(): FiduciaryPoolMember {
  return {
    id: generateId(),
    name: '',
    relationship: undefined,
    address: undefined,
    city: undefined,
    state: undefined,
    zip: undefined,
    phone: undefined,
    email: undefined,
    isEntity: false,
    entityType: undefined,
    notes: undefined,
  };
}

export function createEmptyBeneficiaryDesignation(): BeneficiaryDesignation {
  return {
    poolId: undefined,
    name: '',
    relationship: undefined,
    percentage: 0,
    isEntity: false,
    entityType: undefined,
    perStirpes: true,
  };
}

// Helper to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
