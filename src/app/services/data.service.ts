import { Injectable, signal, computed } from '@angular/core';
import { ICaseData, IAddress, IAssets, IBeneficiary, IBusinessInterest, ICharity, IChild, IClient, IDigitalAsset, IFamilyMember, IFiduciary, IFinancialAccount, IGuardianPreferences, ILifeInsurance, IMaritalInfo, IOtherAsset, IPersonal, IPreviousMarriage, IRealEstate, IRetirementAccount } from '../models/case_data';


// --- DATA SERVICE ---

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Primary signals for reactive state management
  private _casedata = signal<ICaseData>({
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
    charities: [],
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
  });

  // Computed signals for reactive derived state
  readonly casedata = this._casedata.asReadonly();
  readonly personal = computed(() => this._casedata().personal);
  readonly client = computed(() => this._casedata().client);
  readonly maritalInfo = computed(() => this._casedata().marital_info);
  readonly children = computed(() => this._casedata().children);
  readonly assets = computed(() => this._casedata().assets);

  // Computed signals for validation and completion tracking
  readonly isPersonalInfoComplete = computed(() => {
    const personal = this.personal();
    return !!(personal.legal_first_name &&
      personal.legal_last_name &&
      personal.date_of_birth &&
      personal.current_address.address_line1 &&
      personal.current_address.city &&
      personal.current_address.state &&
      personal.current_address.zip);
  });

  readonly completionPercentage = computed(() => {
    const sections = [
      this.isPersonalInfoComplete(),
      // Add other section completion checks here
    ];
    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  });

  // Methods to update specific parts of the case data
  updatePersonal(updates: Partial<IPersonal>) {
    this._casedata.update(current => ({
      ...current,
      personal: { ...current.personal, ...updates }
    }));
  }

  updatePersonalAddress(updates: Partial<IAddress>) {
    this._casedata.update(current => ({
      ...current,
      personal: {
        ...current.personal,
        current_address: { ...current.personal.current_address, ...updates }
      }
    }));
  }

  addPreviousAddress(address: IAddress) {
    this._casedata.update(current => ({
      ...current,
      personal: {
        ...current.personal,
        previous_addresses: [...current.personal.previous_addresses, address]
      }
    }));
  }

  removePreviousAddress(index: number) {
    this._casedata.update(current => ({
      ...current,
      personal: {
        ...current.personal,
        previous_addresses: current.personal.previous_addresses.filter((_, i) => i !== index)
      }
    }));
  }

  updatePreviousAddress(index: number, updates: Partial<IAddress>) {
    this._casedata.update(current => ({
      ...current,
      personal: {
        ...current.personal,
        previous_addresses: current.personal.previous_addresses.map((addr, i) =>
          i === index ? { ...addr, ...updates } : addr
        )
      }
    }));
  }

  // Save method that can return a Promise/Observable for API calls
  async savePersonalInfo(): Promise<boolean> {
    try {
      console.log('Saving personal information:', this.personal());
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update completion percentage after successful save
      this._casedata.update(current => ({
        ...current,
        client: {
          ...current.client,
          completion_percentage: this.completionPercentage()
        }
      }));

      return true;
    } catch (error) {
      console.error('Failed to save personal info:', error);
      return false;
    }
  }

  // Methods for managing children
  addChild(child: IChild) {
    this._casedata.update(current => ({
      ...current,
      children: [...current.children, child]
    }));
  }

  updateChild(index: number, updates: Partial<IChild>) {
    this._casedata.update(current => ({
      ...current,
      children: current.children.map((child, i) =>
        i === index ? { ...child, ...updates } : child
      )
    }));
  }

  removeChild(index: number) {
    this._casedata.update(current => ({
      ...current,
      children: current.children.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing family members
  addFamilyMember(familyMember: IFamilyMember) {
    this._casedata.update(current => ({
      ...current,
      family_members: [...current.family_members, familyMember]
    }));
  }

  updateFamilyMember(index: number, updates: Partial<IFamilyMember>) {
    this._casedata.update(current => ({
      ...current,
      family_members: current.family_members.map((member, i) =>
        i === index ? { ...member, ...updates } : member
      )
    }));
  }

  removeFamilyMember(index: number) {
    this._casedata.update(current => ({
      ...current,
      family_members: current.family_members.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing charities
  addCharity(charity: ICharity) {
    this._casedata.update(current => ({
      ...current,
      charities: [...current.charities, charity]
    }));
  }

  updateCharity(index: number, updates: Partial<ICharity>) {
    this._casedata.update(current => ({
      ...current,
      charities: current.charities.map((charity, i) =>
        i === index ? { ...charity, ...updates } : charity
      )
    }));
  }

  removeCharity(index: number) {
    this._casedata.update(current => ({
      ...current,
      charities: current.charities.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing assets
  addRealEstate(asset: IRealEstate) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: [...current.assets.real_estate_holdings, asset]
      }
    }));
  }

  updateRealEstate(index: number, updates: Partial<IRealEstate>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: current.assets.real_estate_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeRealEstate(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: current.assets.real_estate_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addFinancialAccount(asset: IFinancialAccount) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        financial_account_holdings: [...current.assets.financial_account_holdings, asset]
      }
    }));
  }

  updateFinancialAccount(index: number, updates: Partial<IFinancialAccount>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        financial_account_holdings: current.assets.financial_account_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeFinancialAccount(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        financial_account_holdings: current.assets.financial_account_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addRetirementAccount(asset: IRetirementAccount) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: [...current.assets.retirement_account_holdings, asset]
      }
    }));
  }

  updateRetirementAccount(index: number, updates: Partial<IRetirementAccount>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: current.assets.retirement_account_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeRetirementAccount(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: current.assets.retirement_account_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addLifeInsurance(asset: ILifeInsurance) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: [...current.assets.life_insurance_holdings, asset]
      }
    }));
  }

  updateLifeInsurance(index: number, updates: Partial<ILifeInsurance>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: current.assets.life_insurance_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeLifeInsurance(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: current.assets.life_insurance_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addBusinessInterest(asset: IBusinessInterest) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: [...current.assets.business_interest_holdings, asset]
      }
    }));
  }

  updateBusinessInterest(index: number, updates: Partial<IBusinessInterest>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: current.assets.business_interest_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeBusinessInterest(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: current.assets.business_interest_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addDigitalAsset(asset: IDigitalAsset) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: [...current.assets.digital_asset_holdings, asset]
      }
    }));
  }

  updateDigitalAsset(index: number, updates: Partial<IDigitalAsset>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: current.assets.digital_asset_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeDigitalAsset(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: current.assets.digital_asset_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addOtherAsset(asset: IOtherAsset) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: [...current.assets.other_asset_holdings, asset]
      }
    }));
  }

  updateOtherAsset(index: number, updates: Partial<IOtherAsset>) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: current.assets.other_asset_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeOtherAsset(index: number) {
    this._casedata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: current.assets.other_asset_holdings.filter((_, i) => i !== index)
      }
    }));
  }
  // Template objects for creating new instances
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
