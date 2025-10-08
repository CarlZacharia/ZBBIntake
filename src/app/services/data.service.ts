import { Injectable } from '@angular/core';
import { ICaseData, IAddress, IAssets, IBeneficiary, IBusinessInterest, IChild, IClient,IDigitalAsset,IFamilyMember, IFiduciary, IFinancialAccount, IGuardianPreferences, ILifeInsurance, IMaritalInfo, IOtherAsset, IPersonal, IPreviousMarriage, IRealEstate, IRetirementAccount } from '../models/case_data';


// --- DATA SERVICE ---

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public casedata: ICaseData = {
    client: {
      client_id: null,
      user_account_id: null,
      status: null,
      completion_percentage: 0,
      assigned_attorney_id: null,
      referral_source: null,
    },
    personal: {
      personal_id: null,
      legal_first_name: '',
      legal_middle_name: null,
      legal_last_name: '',
      suffix: null,
      preferred_name: null,
      date_of_birth: null,
      ssn_encrypted: null,
      us_citizen: null,
      citizenship_country: 'USA',
      current_address: {
        address_line1: '',
        address_line2: null,
        city: '',
        state: '',
        zip: ''
      },
      years_at_address: null,
      previous_addresses: [],
      mobile_phone: null,
      home_phone: null,
      email: null,
      preferred_contact_method: 'email',
      occupation: null,
      employer_name: null,
      employer_address: null,
      military_service: false,
      military_branch: null,
      military_service_dates: null,
    },
    marital_info: {
      marital_id: null,
      marital_status: 'single',
      spouse_legal_name: null,
      spouse_dob: null,
      spouse_ssn_encrypted: null,
      marriage_date: null,
      marriage_location: null,
      first_marriage: null,
      prenup_exists: false,
      prenup_document_id: null,
      postnup_exists: false,
      postnup_document_id: null,
      spouse_has_other_children: null,
      relationship_quality: null,
      previous_marriages: [],
      divorce_obligations: null,
      divorce_decree_restrictions: null,
    },
    children: [],
    family_members: [],
    fiduciaries: [],
    guardian_preferences: {
      preference_id: null,
      child_raising_values: null,
      location_importance: null,
      religious_upbringing_preferences: null,
      education_priorities: null,
      other_preferences: null,
    },
    // Initializing the new assets object with empty arrays
    assets: {
      real_estate_holdings: [],
      financial_account_holdings: [],
      retirement_account_holdings: [],
      life_insurance_holdings: [],
      business_interest_holdings: [],
      digital_asset_holdings: [],
      other_asset_holdings: [],
    }
  };



public client: IClient = {
    client_id: null,
    user_account_id: null,
    status: null,
    completion_percentage: 0,
    assigned_attorney_id: null,
    referral_source: null
  };

  public personal: IPersonal = {
    personal_id: null,
    legal_first_name: '',
    legal_middle_name: null,
    legal_last_name: '',
    suffix: null,
    preferred_name: null,
    date_of_birth: null,
    ssn_encrypted: null,
    us_citizen: null,
    citizenship_country: 'USA',
    current_address: {
      address_line1: '',
      address_line2: null,
      city: '',
      state: '',
      zip: ''
    },
    years_at_address: null,
    previous_addresses: [],
    mobile_phone: null,
    home_phone: null,
    email: null,
    preferred_contact_method: 'email',
    occupation: null,
    employer_name: null,
    employer_address: null,
    military_service: false,
    military_branch: null,
    military_service_dates: null
  };

  public maritalInfo: IMaritalInfo = {
    marital_id: null,
    marital_status: 'single',
    spouse_legal_name: null,
    spouse_dob: null,
    spouse_ssn_encrypted: null,
    marriage_date: null,
    marriage_location: null,
    first_marriage: null,
    prenup_exists: false,
    prenup_document_id: null,
    postnup_exists: false,
    postnup_document_id: null,
    spouse_has_other_children: null,
    relationship_quality: null,
    previous_marriages: [],
    divorce_obligations: null,
    divorce_decree_restrictions: null
  };

    public address: IAddress = {
    address_line1: '',
    address_line2: null,
    city: '',
    state: '',
    zip: ''
  };

  public previousMarriage: IPreviousMarriage = {
    spouse_name: '',
    marriage_date: null,
    divorce_date: null,
    location: ''
  };

  public fiduciary: IFiduciary = {
    appointment_id: null,
    role_type: 'executor',
    priority: 'primary',
    appointee_name: '',
    relationship: null,
    contact_phone: null,
    contact_email: null,
    age: null,
    address: null,
    reasons_for_selection: null,
    limitations_or_instructions: null,
    act_jointly: null,
    compensation_desired: null,
    discussed_with_appointee: false,
    health_concerns: null,
    conflict_concerns: null,
    effective_immediately: null
  };

  public child: IChild = {
    child_id: null,
    legal_first_name: '',
    legal_middle_name: null,
    legal_last_name: '',
    suffix: null,
    date_of_birth: null,
    child_of: 'both',
    child_comment: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    marital_status: null,
    has_children: false,
    special_needs: false,
    special_needs_description: null,
    disabilities: null,
    relationship_quality: null,
    financially_responsible: null,
    substance_abuse_concerns: false,
    gambling_concerns: false,
    other_concerns: null,
    excluded_or_reduced: false,
    exclusion_reason: null,
    is_deceased: false,
    date_of_death: null,
    surviving_spouse: null
  };

  public familyMember: IFamilyMember = {
    family_id: null,
    relationship: 'parent',
    legal_name: '',
    date_of_birth: null,
    is_living: true,
    date_of_death: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    financial_support: false,
    support_amount_monthly: null,
    special_needs: false,
    caregiving_responsibilities: false,
    notes: null
  };

  public guardianPreferences: IGuardianPreferences = {
    preference_id: null,
    child_raising_values: null,
    location_importance: null,
    religious_upbringing_preferences: null,
    education_priorities: null,
    other_preferences: null
  };

  public assets: IAssets = {
    real_estate_holdings: [],
    financial_account_holdings: [],
    retirement_account_holdings: [],
    life_insurance_holdings: [],
    business_interest_holdings: [],
    digital_asset_holdings: [],
    other_asset_holdings: [],
  };

  public beneficiary: IBeneficiary = {
    beneficiary_id: null,
    beneficiary_type: 'child',
    child_id: null,
    spouse_id: null,
    family_member_id: null,
    other_name: null,
    percentage: 0,
    calculated_value: null,
    per_stirpes: false,
    notes: null
  };

  public realEstate: IRealEstate = {
    property_id: null,
    property_type: 'primary_residence',
    address_line1: '',
    address_line2: null,
    city: '',
    state: '',
    zip: '',
    title_holding: 'client',
    title_details: null,
    estimated_value: null,
    mortgage_balance: null,
    net_value: null,
    beneficiaries_on_deed: null,
    intended_beneficiary: null,
    special_notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    ownership_value: null
  };

  public financialAccount: IFinancialAccount = {
    account_id: null,
    institution_name: '',
    account_type: 'checking',
    account_number_encrypted: null,
    approximate_balance: null,
    title_type: 'individual',
    joint_owner_name: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    beneficiary_last_reviewed: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  public retirementAccount: IRetirementAccount = {
    retirement_id: null,
    account_type: '401k',
    institution_name: '',
    account_number_encrypted: null,
    approximate_value: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    beneficiary_last_reviewed: null,
    rmd_age_reached: false,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  public businessInterest: IBusinessInterest = {
    business_id: null,
    business_name: '',
    business_type: 'llc',
    ownership_percentage: null,
    estimated_value: null,
    has_other_owners: false,
    other_owners_names: null,
    buy_sell_agreement_exists: false,
    buy_sell_document_id: null,
    succession_plan_exists: false,
    business_vision_after_death: null,
    intended_successor: null,
    successor_is_family: null,
    should_business_be_sold: null,
    notes: null,
    owned_by: null,
    other_owners: null
  };

  public lifeInsurance: ILifeInsurance = {
    policy_id: null,
    insurance_company: '',
    policy_type: 'term',
    policy_number: null,
    face_value: 0,
    death_benefit: 0,
    cash_value: 0,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    owned_by_trust: false,
    trust_name: null,
    annual_premium: 0,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  public digitalAsset: IDigitalAsset = {
    digital_id: null,
    asset_type: 'other',
    asset_name: '',
    platform_or_service: null,
    estimated_value: null,
    username: null,
    access_location: null,
    wallet_type: null,
    seed_phrase_location: null,
    intended_disposition: null,
    access_instructions: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  public otherAsset: IOtherAsset = {
    asset_id: null,
    asset_type: 'other',
    description: '',
    estimated_value: null,
    is_heirloom: false,
    intended_recipient: null,
    special_instructions: null,
    appraisal_exists: false,
    appraisal_date: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  constructor() { }
}
