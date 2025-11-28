export interface IRealEstate {
  real_estate_id?: number | null;
  property_type:
    | 'primary_residence'
    | 'vacation'
    | 'rental'
    | 'land'
    | 'commercial'
    | 'other';
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  title_holding:
    | 'Client'
    | 'Spouse'
    | 'Joint-Spouse'
    | 'TinC'
    | 'JTWROS'
    | 'tod_deed'
    | 'trust'
    | 'llc'
    | 'other';
  title_details: string | null;
  approximate_value: number | null;
  mortgage_balance: number | null;
  net_value: number | null; // estimated_value - mortgage_balance
  beneficiaries_on_deed: string | null;
  intended_beneficiary: string | null;
  special_notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
  ownership_value: number | null; // net_value * (ownership_percentage / 100)
}

/**
 * Interface for a single Financial Account asset.
 */
export interface IBankAccount {
  bank_account_id?: number | null;
  institution_name: string;
  account_type:
    | 'Checking'
    | 'Savings'
    | 'Money market'
    | 'CD'
    | 'Crokerage'
    | 'Other investment';
  account_number_encrypted: string | null;
  approximate_value: number | null;
  balance: number | undefined;
  title_type: 'Individual' | 'Joint' | 'POD' | 'TOD' | 'Trust' | 'Other';
  joint_owner_name: string | null;
  primary_beneficiaries: IBeneficiary[];
  contingent_beneficiaries: IBeneficiary[];
  beneficiary_last_reviewed: string | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
}

export interface INQAccount {
  nq_account_id?: number | null;
  account_name: string;
  balance: number | null;
  institution_name: string;
  account_type:
    | 'Mutual Fund'
    | 'Stocks'
    | 'Bonds'
    | 'Annuity'
    | 'Money market'
    | 'Brokerage'
    | 'Other_investment';
  account_number_encrypted: string | null;
  approximate_value: number | null;
  title_type: 'Individual' | 'Joint' | 'POD' | 'TOD' | 'Trust' | 'Other';
  joint_owner_name: string | null;
  primary_beneficiaries: IBeneficiary[];
  contingent_beneficiaries: IBeneficiary[];
  beneficiary_last_reviewed: string | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
}

/**
 * Interface for a single Retirement Account asset.
 */
export interface IRetirementAccount {
  retirement_account_id: number | null;
  account_name: string;
  balance: number | null;
  account_type:
    | '401k'
    | '403b'
    | 'Traditional IRA'
    | 'Roth IRA'
    | 'SEP'
    | 'Simple IRA'
    | 'Pension'
    | 'Annuity'
    | 'Other';
  institution_name: string;
  account_number_encrypted: string | null;
  approximate_value: number | null;
  primary_beneficiaries: IBeneficiary[];
  contingent_beneficiaries: IBeneficiary[];
  beneficiary_last_reviewed: string | null;
  rmd_age_reached: boolean | number | string | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
}

/**
 * Interface for a single Life Insurance asset.
 */
export interface ILifeInsurance {
  life_insurance_id?: number | null;
  insurance_company: string;
  policy_type: 'Term' | 'Whole life' | 'Universal' | 'Variable' | 'Other';
  policy_number: string | null;
  face_value: number;
  approximate_value: number;
  cash_value: number | null;
  primary_beneficiaries: IBeneficiary[];
  contingent_beneficiaries: IBeneficiary[];
  owned_by_trust: boolean | number | string | null;
  trust_name: string | null;
  annual_premium: number | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
}

/**
 * Interface for a single Business Interest asset.
 */
export interface IBusinessInterest {
  business_interest_id?: number | null;
  business_name: string;
  business_type:
    | 'LLC'
    | 'S Corp'
    | ' C Corp'
    | 'LLP'
    | 'Partnership'
    | 'Sole Prop'
    | 'ther';
  ownership_percentage: number | null;
  approximate_value: number | null;
  has_other_owners: boolean | number | string | null;
  other_owners_names: string | null;
  buy_sell_agreement_exists: boolean | number | string | null;
  buy_sell_document_id: number | null;
  succession_plan_exists: boolean | number | string | null;
  business_vision_after_death: string | null;
  intended_successor: string | null;
  successor_is_family: boolean | number | string | null;
  should_business_be_sold: boolean | number | string | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  other_owners: string | null;
}

/**
 * Interface for a single Digital Asset.
 */
export interface IDigitalAsset {
  digital_asset_id?: number | null;
  asset_type:
    | 'Email'
    | 'Social_media'
    | 'Cryptocurrency'
    | 'NFT'
    | 'Domain'
    | 'Website'
    | 'Online_business'
    | 'Cloud_storage'
    | 'Password_manager'
    | 'Digital_media'
    | 'Loyalty_programs'
    | 'Other';
  asset_name: string;
  platform_or_service: string | null;
  approximate_value: number | null;
  username: string | null;
  access_location: string | null;
  wallet_type: string | null;
  seed_phrase_location: string | null;
  intended_disposition:
    | 'delete'
    | 'preserve'
    | 'transfer'
    | 'memorialize'
    | null;
  access_instructions: string | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
}

/**
 * Interface for any Other Asset.
 */
export interface IOtherAsset {
  other_asset_id?: number | null;
  asset_type:
    | 'vehicle'
    | 'boat'
    | 'rv'
    | 'motorcycle'
    | 'aircraft'
    | 'art'
    | 'antiques'
    | 'jewelry'
    | 'collectibles'
    | 'wine'
    | 'precious_metals'
    | 'intellectual_property'
    | 'livestock'
    | 'farm_equipment'
    | 'timeshare'
    | 'other';
  description: string;
  approximate_value: number | null;
  debtOwed: number | null; // Amount of debt associated with the asset (e.g., vehicle loan)
  netValue: number | null; // estimated_value - debtOwed
  is_heirloom: boolean | number | string | null;
  intended_recipient: string | null;
  special_instructions: string | null;
  appraisal_exists: boolean | number | string | null;
  appraisal_date: string | null;
  owned_by: 'Client' | 'Spouse' | null;
  ownership_percentage: number | null;
  other_owners: string | null;
}

/**
 * Interface for Debts
 */
export interface IDebt {
  debt_id: number | null;
  debt_type:
    | 'Credit card'
    | 'Student loan'
    | 'Personal loan'
    | 'Medical'
    | 'Business loan'
    | 'Tax'
    | 'Co-signer'
    | 'Other';
  creditor_name: string;
  account_number: string | null;
  original_amount: number | null;
  current_balance: number | null;
  monthly_payment: number | null;
  notes: string | null;
  owned_by: 'Client' | 'Spouse' | 'joint' | null;
}

/**
 * Interface for a beneficiary designation on an asset.
 */
export interface IBeneficiary {
  beneficiary_id: number | null;
  beneficiary_type: 'Child' | 'Spouse' | 'Family_member' | 'Other';
  child_id: number | null; // Links to IChild
  spouse_id: number | null; // Could link to spouse info
  family_member_id: number | null; // Links to IFamilyMember
  other_name: string | null; // For non-family beneficiaries
  percentage: number; // Percentage allocation
  calculated_value: number | null; // Calculated dollar value based on percentage
  per_stirpes: boolean | number | string | null; // Whether inheritance passes to descendants if beneficiary is deceased
  notes: string | null;
}

/**
 * Main container for all asset arrays.
 */
export interface IAssets {
  real_estate_holdings: IRealEstate[];
  bank_account_holdings: IBankAccount[];
  nq_account_holdings: INQAccount[];
  retirement_account_holdings: IRetirementAccount[];
  life_insurance_holdings: ILifeInsurance[];
  business_interest_holdings: IBusinessInterest[];
  digital_asset_holdings: IDigitalAsset[];
  other_asset_holdings: IOtherAsset[];
}

// --- CORE INTERFACE DEFINITIONS ---

export interface IAddress {
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
}

export interface IPreviousMarriage {
  spouse_name: string;
  marriage_date: string | null;
  divorce_date: string | null;
  location: string;
}

export interface IChild {
  child_id: number | null;
  legal_first_name: string;
  legal_middle_name: string | null;
  legal_last_name: string;
  suffix: string | null;
  date_of_birth: string | null;
  child_of: 'Client' | 'Spouse' | 'Both';
  child_comment: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed' | null;
  has_children: boolean | number | string | null;

  // Relationship & character assessment
  relationship_quality:
    | 'Close'
    | 'Good'
    | 'Distant'
    | 'Estranged'
    | 'Complicated'
    | null;
  financially_responsible:
    | 'Very'
    | 'Somewhat'
    | 'Not_Really'
    | 'Concerning'
    | null;

  // Consolidated concerns - array of concern IDs from lookup table
  concern_ids: number[];
  concern_notes: string | null; // General notes about any concerns

  // Exclusion
  excluded_or_reduced: boolean | number | string | null;
  exclusion_reason: string | null;

  // Deceased
  is_deceased: boolean | number | string | null;
  date_of_death: string | null;
  surviving_spouse: string | null;
}

// Supporting interfaces for the concerns dropdown
export interface IBeneficiaryConcern {
  id: number;
  concern_name: string;
  suggests_snt: string | number;
  suggests_trust: string | number;
}

export interface IConcernCategory {
  category_id: number;
  category_name: string;
  concerns: IBeneficiaryConcern[];
}

export interface IFamilyMember {
  family_member_id: number | null;
  relationship:
    | 'Grandchild'
    | 'Parent'
    | 'Sibling'
    | 'Niece'
    | 'Nephew'
    | 'Aunt_uncle'
    | 'Cousin'
    | 'Other_dependent'
    | 'Close_friend'
    | 'Godchild'
    | 'Other';
  legal_name: string;
  date_of_birth: string | null;
  is_living: boolean | number | string | null;
  date_of_death: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  financial_support: boolean | number | string | null;
  support_amount_monthly: number | null;
  caregiving_responsibilities: boolean | number | string | null;
  caregiving_details: string | null;

  // Consolidated concerns - replaces special_needs boolean
  concern_ids: number[];
  concern_notes: string | null;

  notes: string | null;
}

export interface ICharity {
  charity_id: number | null;
  organization_name: string;
  ein_tax_id: string | null;
  charity_type:
    | 'Religious'
    | 'Educational'
    | 'Medical'
    | 'Environmental'
    | 'Animal_welfare'
    | 'Arts_culture'
    | 'Social_services'
    | 'Community'
    | 'Other';
  mission_description: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  current_donor: boolean | number | string | null;
  annual_contribution_amount: number | null;
  years_supporting: number | null;
  personal_connection: string | null;
  intended_gift_type:
    | 'Percentage'
    | 'Specific_amount'
    | 'Specific_asset'
    | 'Residuary'
    | null;
  intended_percentage: number | null;
  intended_dollar_amount: number | null;
  intended_asset_description: string | null;
  gift_restrictions: string | null;
  memorial_gift: boolean | number | string | null;
  memorial_name: string | null;
  endowment_fund: boolean | number | string | null;
  endowment_purpose: string | null;
  recognition_preferences: 'Anonymous' | 'Public' | 'Family_only' | null;
  notes: string | null;
}

export interface IFiduciary {
  appointment_id: number | null;
  role_type:
    | 'Executor'
    | 'Trustee'
    | 'Financial_poa'
    | 'Healthcare_poa'
    | 'Guardian_person'
    | 'Guardian_property';
  priority: 'Primary' | 'First_alternate' | 'Second_alternate' | 'Co_trustee';
  appointee_name: string;
  relationship: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  age: number | null;
  address: string | null;
  reasons_for_selection: string | null;
  limitations_or_instructions: string | null;
  act_jointly: boolean | number | string | null;
  compensation_desired: boolean | number | string | null;
  discussed_with_appointee: boolean | number | string | null;
  health_concerns: string | null;
  conflict_concerns: string | null;
  effective_immediately: boolean | number | string | null;
}

export interface IGuardianPreferences {
  preference_id: number | null;
  child_raising_values: string | null;
  location_importance: string | null;
  religious_upbringing_preferences: string | null;
  education_priorities: string | null;
  other_preferences: string | null;
}

export interface IMaritalInfo {
  marital_id: number | null;
  marital_status:
    | 'Single'
    | 'Married'
    | 'Widowed'
    | 'Divorced'
    | 'Domestic_partnership'
    | null;
  spouse_legal_name: string | null;
  spouse_dob: string | null;
  spouse_ssn_encrypted: string | null;
  marriage_date: string | null;
  marriage_location: string | null;
  first_marriage: string | null;
  prenup_exists: string | null;
  prenup_document_id: number | null;
  postnup_exists: string | null;
  postnup_document_id: number | null;
  spouse_has_other_children: string | null;
  relationship_quality:
    | 'Excellent'
    | 'Good'
    | 'Strained'
    | 'Complicated'
    | null;
  previous_marriages: IPreviousMarriage[];
  divorce_obligations: string | null;
  divorce_decree_restrictions: string | null;
}

export interface IPersonal {
  personal_id: number | null;
  legal_first_name: string;
  legal_middle_name: string | null;
  legal_last_name: string;
  suffix: string | null;
  preferred_name: string | null;
  date_of_birth: string | null;
  ssn_encrypted: string | null;
  us_citizen: 'Yes' | 'No' | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  citizenship_country: string | null;
  years_at_address: number | null;
  mobile_phone: string | null;
  home_phone: string | null;
  email: string | null;
  preferred_contact_method: 'Mobile' | 'Home' | 'Email' | 'Text' | null;
  occupation: string | null;
  employer_name: string | null;
  employer_address: string | null;
  military_service: 'Yes' | 'No' | null;
  military_branch: string | null;
  military_service_dates: string | null;
}

export interface IClient {
  portal_user_id: number | null;
  client_id: number | null;
  status: string | null;
  completion_percentage: number;
  assigned_attorney_id: number | null;
  office: string | null;
  referral_source: string | null;
}

/**
 * Main data structure that combines all related objects.
 */
export interface IClientData {
  client: IClient;
  personal: IPersonal;
  marital_info: IMaritalInfo;
  children: IChild[];
  family_members: IFamilyMember[];
  charities: ICharity[];
  fiduciaries: IFiduciary[];
  guardianship_preferences: IGuardianPreferences;
  assets: IAssets;
  debts: IDebt[];
}
