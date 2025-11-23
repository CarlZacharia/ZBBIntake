import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { IClient, IAddress, IAssets, IBeneficiary, IBusinessInterest, ICharity, IChild, IDigitalAsset, IFamilyMember, IFiduciary, IBankAccount, INQAccount, IGuardianPreferences, ILifeInsurance, IMaritalInfo, IOtherAsset, IPersonal, IPreviousMarriage, IRealEstate, IRetirementAccount } from '../models/case_data';
// Combined interface for client-centric data
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
import { IDebt } from '../models/case_data';
// ...existing code...
// Add IDebt to the import list above


// --- DATA SERVICE ---

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly API_URL = 'https://zacbrownportal.com/api/clientdata.php'; // Now points to combined client data endpoint
    private readonly UPDATE_URL = 'https://zacbrownportal.com/api/clientupdate.php';
  /**
   * Save a section of client data to the backend (clientupdate.php)
   * @param table The table name to update
   * @param data The data object (must include portal_user_id)
   */
  saveClientSection(table: string, data: any): Observable<any> {
    return this.http.post(this.UPDATE_URL, { table, data });
  }
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  // Primary signals for reactive state management
  private _clientdata = signal<IClientData>({
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
      address_line1: '',
      address_line2: null,
      city: '',
      state: '',
      zip: '',
      years_at_address: null,
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
    guardianship_preferences: {
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
      bank_account_holdings: [],
      nq_account_holdings: [],
      retirement_account_holdings: [],
      life_insurance_holdings: [],
      business_interest_holdings: [],
      digital_asset_holdings: [],
      other_asset_holdings: []
    },
    debts: []
  });

  // Computed signals for reactive derived state
  readonly clientdata = this._clientdata.asReadonly();
  readonly personal = computed(() => this._clientdata().personal);
  readonly client = computed(() => this._clientdata().client);
  readonly maritalInfo = computed(() => this._clientdata().marital_info);
  readonly children = computed(() => this._clientdata().children);
  readonly assets = computed(() => this._clientdata().assets);
  readonly debts = computed(() => this._clientdata().debts);

  // Computed signal for total debts
  readonly totalDebts = computed(() => {
    const debts = this.debts();
    if (!debts || debts.length === 0) return 0;
    return debts.reduce((sum, debt) => sum + (Number(debt.current_balance) || 0), 0);
  });

  // Computed signals for validation and completion tracking
  readonly isPersonalInfoComplete = computed(() => {
    const personal = this.personal();
    return !!(personal.legal_first_name &&
      personal.legal_last_name &&
      personal.date_of_birth &&
      personal.address_line1 &&
      personal.city &&
      personal.state &&
      personal.zip);
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

  this._clientdata.update(current => ({
      ...current,
      personal: { ...current.personal, ...updates }
    }));
    // Save to backend
  const portal_user_id = this._clientdata().personal.personal_id;
  this.saveClientSection('personal', { ...this._clientdata().personal, portal_user_id }).subscribe();

    this.autoSave();
  }

  updateMaritalInfo(updates: Partial<IMaritalInfo>) {

  this._clientdata.update(current => ({
      ...current,
      marital_info: { ...current.marital_info, ...updates }
    }));
    // Save to backend
  const portal_user_id = this._clientdata().marital_info.marital_id;
  this.saveClientSection('marital_info', { ...this._clientdata().marital_info, portal_user_id }).subscribe();

    this.autoSave();
  }

  updatePersonalAddress(updates: Partial<IAddress>) {

    this._clientdata.update(current => ({
      ...current,
      personal: {
        ...current.personal,
        ...updates
      }
    }));
    // Save to backend
  const portal_user_id = this._clientdata().personal.personal_id;
  this.saveClientSection('personal', { ...this._clientdata().personal, portal_user_id }).subscribe();
      this.autoSave();
    }

    // --- Deduplicated updateClient ---
    updateClient(updates: Partial<IClient>) {
        this._clientdata.update(current => ({
            ...current,
            client: { ...current.client, ...updates }
        }));
        // Save to backend
        const portal_user_id = this._clientdata().client.client_id;
        this.saveClientSection('client', { ...this._clientdata().client, portal_user_id }).subscribe();
        this.autoSave();
    }

    // --- Deduplicated updateGuardianPreferences ---
    updateGuardianPreferences(updates: Partial<IGuardianPreferences>) {
        this._clientdata.update(current => ({
            ...current,
            guardianship_preferences: { ...current.guardianship_preferences, ...updates }
        }));
        // Save to backend
        const portal_user_id = this._clientdata().guardianship_preferences.preference_id;
        this.saveClientSection('guardianship_preferences', { ...this._clientdata().guardianship_preferences, portal_user_id }).subscribe();
        this.autoSave();
    }


  // Save method that can return a Promise/Observable for API calls
  async savePersonalInfo(): Promise<boolean> {




    try {
      console.log('Saving personal information:', this.personal());
      // Use the new saveclientdata method
      const savedData = await this.saveclientdata().toPromise();
      if (savedData) {
        // Update local state with saved data (cast to IClientData)
  this._clientdata.set(savedData as IClientData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save personal info:', error);
      return false;
    }
  }

  // Methods for managing children
  addChild(child: IChild) {
    this._clientdata.update(current => ({
      ...current,
      children: [...current.children, child]
    }));
  }

  updateChild(index: number, updates: Partial<IChild>) {
    this._clientdata.update(current => ({
      ...current,
      children: current.children.map((child, i) =>
        i === index ? { ...child, ...updates } : child
      )
    }));
  }

  removeChild(index: number) {
    this._clientdata.update(current => ({
      ...current,
      children: current.children.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing family members
  addFamilyMember(familyMember: IFamilyMember) {
    this._clientdata.update(current => ({
      ...current,
      family_members: [...current.family_members, familyMember]
    }));
  }

  updateFamilyMember(index: number, updates: Partial<IFamilyMember>) {
    this._clientdata.update(current => ({
      ...current,
      family_members: current.family_members.map((member, i) =>
        i === index ? { ...member, ...updates } : member
      )
    }));
  }

  removeFamilyMember(index: number) {
    this._clientdata.update(current => ({
      ...current,
      family_members: current.family_members.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing charities
  addCharity(charity: ICharity) {
    this._clientdata.update(current => ({
      ...current,
      charities: [...current.charities, charity]
    }));
  }

  updateCharity(index: number, updates: Partial<ICharity>) {
    this._clientdata.update(current => ({
      ...current,
      charities: current.charities.map((charity, i) =>
        i === index ? { ...charity, ...updates } : charity
      )
    }));
  }

  removeCharity(index: number) {
    this._clientdata.update(current => ({
      ...current,
      charities: current.charities.filter((_, i) => i !== index)
    }));
  }

  // Methods for managing assets
  addRealEstate(asset: IRealEstate) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: [...current.assets.real_estate_holdings, asset]
      }
    }));
  }

  updateRealEstate(index: number, updates: Partial<IRealEstate>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: current.assets.real_estate_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addBankAccount(asset: IBankAccount) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: [...current.assets.bank_account_holdings, asset]
      }
    }));
  }

  updateBankAccount(index: number, updates: Partial<IBankAccount>) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: current.assets.bank_account_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeBankAccount(index: number) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: current.assets.bank_account_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addNQAccount(asset: INQAccount) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: [...current.assets.nq_account_holdings, asset]
      }
    }));
  }

  updateNQAccount(index: number, updates: Partial<INQAccount>) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: current.assets.nq_account_holdings.map((asset, i) =>
          i === index ? { ...asset, ...updates } : asset
        )
      }
    }));
  }

  removeNQAccount(index: number) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: current.assets.nq_account_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addRetirementAccount(asset: IRetirementAccount) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: [...current.assets.retirement_account_holdings, asset]
      }
    }));
  }

  updateRetirementAccount(index: number, updates: Partial<IRetirementAccount>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: current.assets.retirement_account_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addLifeInsurance(asset: ILifeInsurance) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: [...current.assets.life_insurance_holdings, asset]
      }
    }));
  }

  updateLifeInsurance(index: number, updates: Partial<ILifeInsurance>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: current.assets.life_insurance_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addBusinessInterest(asset: IBusinessInterest) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: [...current.assets.business_interest_holdings, asset]
      }
    }));
  }

  updateBusinessInterest(index: number, updates: Partial<IBusinessInterest>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: current.assets.business_interest_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addDigitalAsset(asset: IDigitalAsset) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: [...current.assets.digital_asset_holdings, asset]
      }
    }));
  }

  updateDigitalAsset(index: number, updates: Partial<IDigitalAsset>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: current.assets.digital_asset_holdings.filter((_, i) => i !== index)
      }
    }));
  }

  addOtherAsset(asset: IOtherAsset) {
    this._clientdata.update(current => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: [...current.assets.other_asset_holdings, asset]
      }
    }));
  }

  updateOtherAsset(index: number, updates: Partial<IOtherAsset>) {
    this._clientdata.update(current => ({
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
    this._clientdata.update(current => ({
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

  public bankAccount: IBankAccount = {
    account_id: null,
    institution_name: '',
    account_type: 'checking',
    account_number_encrypted: null,
    approximate_value: null,
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

    public nqAccount: INQAccount = {
    account_id: null,
    institution_name: '',
    account_type: 'mutual fund',
    account_number_encrypted: null,
    approximate_value: null,
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
    debtOwed: 0,
    netValue: null,
    is_heirloom: false,
    intended_recipient: null,
    special_instructions: null,
    appraisal_exists: false,
    appraisal_date: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null
  };

  constructor() {
    // Initialize case data with user context when available
    this.initializeClientData();
  }

  /**
   * Get current user ID from auth service
   */
  getCurrentUserId(): number | null {
    return this.authService.getCurrentUserId();
  }

  /**
   * Check if current user is authenticated (client-based)
   */
  isClientAuthenticated(): boolean {
    return !!this.authService.getCurrentUserId();
  }

  /**
   * Reset case data (for logout or new user)
   */
  resetclientdata(): void {
    this._clientdata.set({
      client: {
        client_id: null,
        user_account_id: this.authService.getCurrentUserId(),
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
        address_line1: '',
        address_line2: null,
        city: '',
        state: '',
        zip: '',
        years_at_address: null,
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
      guardianship_preferences: {
        preference_id: null,
        child_raising_values: null,
        location_importance: null,
        religious_upbringing_preferences: null,
        education_priorities: null,
        other_preferences: null,
      },
      assets: {
        real_estate_holdings: [],
        bank_account_holdings: [],
        nq_account_holdings: [],
        retirement_account_holdings: [],
        life_insurance_holdings: [],
        business_interest_holdings: [],
        digital_asset_holdings: [],
        other_asset_holdings: [],
      },
      debts: []
    });
  }

  /**
   * Force save case data immediately (bypass auto-save delay)
   */
  forceSave(): Observable<IClientData> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }

    return this.saveclientdata();
  }

  /**
   * Initialize case data with current user context
   */
  /**
   * Initialize client data with current user context
   */
  private initializeClientData(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this._clientdata.update(current => ({
        ...current,
        client: {
          ...current.client,
          user_account_id: userId
        }
      }));

      // Load existing client data for this user
      this.loadClientData().subscribe({
        next: (clientData) => {
          if (clientData) {
            this._clientdata.set(clientData);
          }
        },
        error: (error) => {
          console.warn('Could not load existing client data:', error);
        }
      });
    }
  }

  /**
   * Load case data from server for current user
   */
  /**
   * Load client data from server for current user
   */
  loadClientData(): Observable<IClientData | null> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Fetch combined client data for the current user
    return this.http.get<IClientData>(`${this.API_URL}?id=${userId}`).pipe(
      map(response => response || null),
      catchError(error => {
        if (error.status === 404) {
          // No client data exists yet - this is normal for new users
          return [null];
        }
        throw error;
      })
    );
  }

  /** CRUD for Debts
   * Add, Update, Remove methods for debts can be implemented here
  */

    // Debts CRUD methods
  addDebt(debt: IDebt) {
    this._clientdata.update(current => ({
      ...current,
      debts: [...current.debts, debt]
    }));
    this.autoSave();
  }

  updateDebt(index: number, updates: Partial<IDebt>) {
    this._clientdata.update(current => ({
      ...current,
      debts: current.debts.map((debt, i) => i === index ? { ...debt, ...updates } : debt)
    }));
    this.autoSave();
  }

  removeDebt(index: number) {
    this._clientdata.update(current => ({
      ...current,
      debts: current.debts.filter((_, i) => i !== index)
    }));
    this.autoSave();
  }

  /**
   * Save case data to server
   */
  saveclientdata(): Observable<IClientData> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      // Silently skip saving if no user is authenticated
      return new Observable<IClientData>(observer => {
        observer.complete();
      });
    }

    const clientData = this._clientdata();
    // Ensure user_account_id is set in client section
    const dataToSave = {
      ...clientData,
      client: {
        ...clientData.client,
        user_account_id: userId
      }
    };

    // Save the full client data object (POST to clientdata.php)
    return this.http.post<IClientData>(`${this.API_URL}?id=${userId}`, dataToSave);
  }

  /**
   * Auto-save case data (debounced)
   */
  private saveTimeout?: any;

  private autoSave(): void {

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout for 2 seconds
    this.saveTimeout = setTimeout(() => {
      this.saveclientdata().subscribe({
        next: (savedData) => {
          // Update local client data with server response (includes IDs)
          this._clientdata.set(savedData as IClientData);
          console.log('Client data auto-saved successfully');
        },
        error: (error) => {
          console.error('Auto-save failed:', error);
        }
      });
    }, 2000);
  }
}
