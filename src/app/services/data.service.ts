import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  IClient,
  IAddress,
  IAssets,
  IBeneficiary,
  IBusinessInterest,
  ICharity,
  IChild,
  IDigitalAsset,
  IFamilyMember,
  IFiduciary,
  IBankAccount,
  INQAccount,
  IGuardianPreferences,
  ILifeInsurance,
  IMaritalInfo,
  IOtherAsset,
  IPersonal,
  IPreviousMarriage,
  IRealEstate,
  IRetirementAccount,
} from '../models/case_data';
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
  providedIn: 'root',
})
export class DataService {
  homestate: string | null = null;

  booleanFields = [
    'special_needs',
    'has_children',
    'substance_abuse_concerns',
    'gambling_concerns',
    'excluded_or_reduced',
    'current_donor',
    'memorial_gift',
    'endowment_fund',
    'rmd_age_reached',
    'owned_by_trust',
    'buy_sell_agreement_exists',
    'succession_plan_exists',
    'should_business_be_sold',
    'is_heirloom',
    'appraisal_exists',
    'act_jointly',
    'discussed_with_appointee',
    'effective_immediately',
    // Add all other boolean fields here
  ];

  /**

  /**
   * Public setter for clientdata (used after login)
   */

  public setClientData(data: IClientData) {
    if (!data.marital_info) {
      console.warn(
        'spouse_ssn_encrypted is missing from marital_info:',
        data.marital_info,
      );
    }
    this._clientdata.set(data);
  }

  private readonly API_URL = 'https://zacbrownportal.com/api/clientdata.php'; // Now points to combined client data endpoint
  private readonly UPDATE_URL =
    'https://zacbrownportal.com/api/clientupdate.php';
  public pui: number | null = null;

  /**
   * Save a section of client data to the backend (clientupdate.php)
   * @param table The table name to update
   * @param data The data object (must include portal_user_id)
   */

  saveClientSection(
    table: string,
    data: any,
    asset_id_type?: string,
  ): Observable<any> {
    const payload: any = { table, data };
    if (asset_id_type) {
      payload.asset_id_type = asset_id_type;
    }
    return this.http.post(this.UPDATE_URL, payload);
  }

  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  // Primary signals for reactive state management
  private _clientdata = signal<IClientData>({
    client: {
      portal_user_id: null,
      client_id: null,
      status: null,
      completion_percentage: 0,
      assigned_attorney_id: null,
      office: null,
      referral_source: null,
    },
    personal: {
      personal_id: null,
      legal_first_name: '',
      legal_middle_name: null,
      legal_last_name: '',
      suffix: null,
      sex: null,
      homestate: null,
      homestateother: null,
      date_of_birth: null,
      ssn_encrypted: null,
      us_citizen: 'Yes',
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
      preferred_contact_method: 'Email',
      occupation: null,
      employer_name: null,
      employer_address: null,
      military_service: 'No',
      military_branch: null,
      military_service_dates: null,
    },
    marital_info: {
      marital_id: null,
      marital_status: null,
      spouse_legal_name: null,
      spouse_dob: null,
      spouse_ssn_encrypted: null,
      spouse_sex: null,
      marriage_date: null,
      marriage_location: null,
      first_marriage: null,
      occupation: null,
      employer_name: null,
      employer_address: null,
      mobile_phone: null,
      home_phone: null,
      email: null,
      preferred_contact_method: 'Email',
      prenup_exists: null,
      prenup_document_id: null,
      postnup_exists: null,
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
      other_asset_holdings: [],
    },
    debts: [],
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
    return debts.reduce(
      (sum, debt) => sum + (Number(debt.current_balance) || 0),
      0,
    );
  });

  // Computed signal for secured debts (mortgages + other asset debts)
  readonly securedDebts = computed(() => {
    const assets = this.assets();
    let total = 0;
    // Mortgages from real estate holdings
    if (Array.isArray(assets.real_estate_holdings)) {
      total += assets.real_estate_holdings.reduce(
        (sum, re) => sum + (Number(re.mortgage_balance) || 0),
        0,
      );
    }
    // debtOwed from other asset holdings
    if (Array.isArray(assets.other_asset_holdings)) {
      total += assets.other_asset_holdings.reduce(
        (sum, oa) => sum + (Number(oa.debtOwed) || 0),
        0,
      );
    }
    return total;
  });

  // Computed signal for total of all debts (unsecured + secured)
  readonly totalAllDebts = computed(() => {
    return (this.totalDebts() || 0) + (this.securedDebts() || 0);
  });

  // Computed signal for net estate value (all assets minus all debts)
  readonly netEstateValue = computed(() => {
    return (this.totalAssetValue() || 0) - (this.totalAllDebts() || 0);
  });

  // Computed signal for total asset value (sums balance and approximate_value for bank, NQ, retirement)
  readonly totalAssetValue = computed(() => {
    const assets = this.assets();
    if (!assets) return 0;
    let total = 0;
    // Bank accounts
    if (Array.isArray(assets.bank_account_holdings)) {
      total += assets.bank_account_holdings.reduce(
        (sum, acc) => sum + Number(acc.approximate_value ?? 0),
        0,
      );
    }
    // NQ accounts
    if (Array.isArray(assets.nq_account_holdings)) {
      total += assets.nq_account_holdings.reduce(
        (sum, acc) => sum + Number(acc.approximate_value ?? 0),
        0,
      );
    }
    // Retirement accounts
    if (Array.isArray(assets.retirement_account_holdings)) {
      total += assets.retirement_account_holdings.reduce(
        (sum, acc) => sum + Number(acc.approximate_value ?? 0),
        0,
      );
    }
    // Real estate
    if (Array.isArray(assets.real_estate_holdings)) {
      total += assets.real_estate_holdings.reduce(
        (sum, asset) => sum + Number(asset.approximate_value ?? 0),
        0,
      );
    }
    // Life insurance
    if (Array.isArray(assets.life_insurance_holdings)) {
      total += assets.life_insurance_holdings.reduce(
        (sum, asset) => sum + Number(asset.approximate_value ?? 0),
        0,
      );
    }
    // Business interests
    if (Array.isArray(assets.business_interest_holdings)) {
      total += assets.business_interest_holdings.reduce(
        (sum, asset) => sum + Number(asset.approximate_value ?? 0),
        0,
      );
    }
    // Digital assets
    if (Array.isArray(assets.digital_asset_holdings)) {
      total += assets.digital_asset_holdings.reduce(
        (sum, asset) => sum + Number(asset.approximate_value ?? 0),
        0,
      );
    }
    // Other assets
    if (Array.isArray(assets.other_asset_holdings)) {
      total += assets.other_asset_holdings.reduce(
        (sum, asset) => sum + Number(asset.approximate_value ?? 0),
        0,
      );
    }
    return total;
  });

  // Computed signals for validation and completion tracking
  readonly isPersonalInfoComplete = computed(() => {
    const personal = this.personal();
    return !!(
      personal.legal_first_name &&
      personal.legal_last_name &&
      personal.date_of_birth &&
      personal.address_line1 &&
      personal.city &&
      personal.state &&
      personal.zip
    );
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
    this._clientdata.update((current) => ({
      ...current,
      personal: { ...current.personal, ...updates },
    }));
    // Save to backend
    const portal_user_id = this.pui;
    this.saveSection('personal', this._clientdata().personal, portal_user_id);
    this.autoSave();
  }

  updateMaritalInfo(updates: Partial<IMaritalInfo>) {
    this._clientdata.update((current) => ({
      ...current,
      marital_info: { ...current.marital_info, ...updates },
    }));
    // Save to backend with correct portal_user_id
    const portal_user_id = this.pui;
    if (!portal_user_id) {
      console.warn('Cannot update marital_info: portal_user_id is not set');
      return;
    }
    this.saveSection(
      'marital_info',
      this._clientdata().marital_info,
      portal_user_id,
    );
    this.autoSave();
  }

  updatePersonalAddress(updates: Partial<IAddress>) {
    this._clientdata.update((current) => ({
      ...current,
      personal: {
        ...current.personal,
        ...updates,
      },
    }));
    // Save to backend using portal_user_id
    const portal_user_id = this.pui;
    this.saveSection('personal', this._clientdata().personal, portal_user_id);
    this.autoSave();
  }

  /**
   * Dynamically save a section to the correct table
   */
  saveSection(table: string, sectionData: any, portal_user_id: any) {
    // Use pui if not provided
    const id = portal_user_id || this.pui;
    if (!id) {
      console.warn(`Cannot update ${table}: portal_user_id is not set`);
      return;
    }
    const payload = { ...sectionData, portal_user_id: id };
    this.saveClientSection(table, payload).subscribe();
  }

  // --- Deduplicated updateClient ---
  updateClient(updates: Partial<IClient>) {
    this._clientdata.update((current) => ({
      ...current,
      client: { ...current.client, ...updates },
    }));
    // Save to backend
    const portal_user_id = this._clientdata().client.client_id;
    this.saveClientSection('client', {
      ...this._clientdata().client,
      portal_user_id,
    }).subscribe();
    this.autoSave();
  }

  // --- Deduplicated updateGuardianPreferences ---
  updateGuardianPreferences(updates: Partial<IGuardianPreferences>) {
    this._clientdata.update((current) => ({
      ...current,
      guardianship_preferences: {
        ...current.guardianship_preferences,
        ...updates,
      },
    }));
    // Save to backend
    const portal_user_id =
      this._clientdata().guardianship_preferences.preference_id;
    this.saveClientSection('guardianship_preferences', {
      ...this._clientdata().guardianship_preferences,
      portal_user_id,
    }).subscribe();
    this.autoSave();
  }

  // Save method that can return a Promise/Observable for API calls
  async savePersonalInfo(): Promise<boolean> {
    try {
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

  /**
   * Save marital_info section to backend and update local state
   */
  async saveMaritalInfo(): Promise<boolean> {
    try {
      console.log('Saving marital information:', this.maritalInfo());
      // Save only the marital_info section using saveSection
      const portal_user_id = this.pui;
      if (!portal_user_id) {
        console.warn('Cannot save marital_info: portal_user_id is not set');
        return false;
      }
      // Save to backend and await response
      const savedData = await this.saveClientSection('marital_info', {
        ...this.maritalInfo(),
        portal_user_id,
      }).toPromise();
      if (savedData) {
        // Update local state with saved data (cast to IClientData)
        console.log('Setting clientdata after saveMaritalInfo:', savedData);
        this._clientdata.set(savedData as IClientData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save marital info:', error);
      return false;
    }
  }

  /**
   * Save guardianship_preferences section to backend and update local state
   */
  async saveGuardianPreferences(): Promise<boolean> {
    try {
      console.log('Saving guardianship preferences:', this.guardianPreferences);
      const portal_user_id = this.pui;
      if (!portal_user_id) {
        console.warn(
          'Cannot save guardianship_preferences: portal_user_id is not set',
        );
        return false;
      }
      // Save to backend and await response
      const savedData = await this.saveClientSection(
        'guardianship_preferences',
        { ...this.guardianPreferences, portal_user_id },
      ).toPromise();
      if (savedData) {
        // Update local state with saved data (cast to IClientData)
        console.log(
          'Setting clientdata after saveGuardianPreferences:',
          savedData,
        );
        this._clientdata.set(savedData as IClientData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save guardianship preferences:', error);
      return false;
    }
  }

  // All beneficiary-related data (children, family members, charities) is loaded and updated only via loadClientData() and saveclientdata().
  // To add, update, or remove beneficiaries, update the local _clientdata signal and call saveclientdata() to persist changes.

  // Example: Add a child
  addChild(child: IChild) {
    this.saveClientSection(
      'child',
      {
        ...child,
        action: 'insert',
        portal_user_id: this.pui,
      },
      'child_id',
    ).subscribe({
      next: (response) => {
        console.log('Child added:', response);
        const newChild = { ...child, child_id: response.insert_id };
        this._clientdata.update((current) => ({
          ...current,
          children: [...current.children, newChild],
        }));
      },
      error: (err) => console.error('Child add failed:', err),
    });
  }
  // Example: Update a child
  updateChild(index: number, updates: Partial<IChild>) {
    // Update local state
    this._clientdata.update((current) => ({
      ...current,
      children: current.children.map((child, i) =>
        i === index ? { ...child, ...updates } : child,
      ),
    }));

    // Save to server via clientupdate.php
    const child = this._clientdata().children[index];
    this.saveClientSection(
      'child',
      {
        ...child,
        action: 'update',
        portal_user_id: this.pui,
      },
      'child_id',
    ).subscribe({
      next: (response) => console.log('Child saved:', response),
      error: (err) => console.error('Child save failed:', err),
    });
  }

  // Example: Remove a child
  removeChild(index: number) {
    // Get the child before removing from local state
    const child = this._clientdata().children[index];

    // Update local state
    this._clientdata.update((current) => ({
      ...current,
      children: current.children.filter((_, i) => i !== index),
    }));

    // Delete from server via clientupdate.php
    this.saveClientSection(
      'child',
      {
        child_id: child.child_id,
        portal_user_id: this.pui,
        action: 'delete',
      },
      'child_id',
    ).subscribe({
      next: (response) => console.log('Child deleted:', response),
      error: (err) => console.error('Child delete failed:', err),
    });
  }

  // Family members
  addFamilyMember(familyMember: IFamilyMember) {
    // Save to server first, then update local state with the returned ID
    this.saveClientSection(
      'family_member',
      {
        ...familyMember,
        action: 'insert',
        portal_user_id: this.pui,
      },
      'family_member_id',
    ).subscribe({
      next: (response) => {
        console.log('Family member added:', response);
        // Update local state with the new ID from the database
        const newMember = {
          ...familyMember,
          family_member_id: response.insert_id,
        };
        this._clientdata.update((current) => ({
          ...current,
          family_members: [...current.family_members, newMember],
        }));
      },
      error: (err) => console.error('Family member add failed:', err),
    });
  }

  updateFamilyMember(index: number, updates: Partial<IFamilyMember>) {
    this._clientdata.update((current) => ({
      ...current,
      family_members: current.family_members.map((member, i) =>
        i === index ? { ...member, ...updates } : member,
      ),
    }));

    const member = this._clientdata().family_members[index];
    this.saveClientSection(
      'family_member',
      {
        ...member,
        action: 'update',
        portal_user_id: this.pui,
      },
      'family_member_id',
    ).subscribe({
      next: (response) => console.log('Family member saved:', response),
      error: (err) => console.error('Family member save failed:', err),
    });
  }

  removeFamilyMember(index: number) {
    const member = this._clientdata().family_members[index];

    this._clientdata.update((current) => ({
      ...current,
      family_members: current.family_members.filter((_, i) => i !== index),
    }));

    this.saveClientSection(
      'family_member',
      {
        family_member_id: member.family_member_id,
        portal_user_id: this.pui,
        action: 'delete',
      },
      'family_member_id',
    ).subscribe({
      next: (response) => console.log('Family member deleted:', response),
      error: (err) => console.error('Family member delete failed:', err),
    });
  }

  // Charities
  addCharity(charity: ICharity) {
    this.saveClientSection(
      'charity',
      {
        ...charity,
        action: 'insert',
        portal_user_id: this.pui,
      },
      'charity_id',
    ).subscribe({
      next: (response) => {
        console.log('Charity added:', response);
        const newCharity = { ...charity, charity_id: response.insert_id };
        this._clientdata.update((current) => ({
          ...current,
          charities: [...current.charities, newCharity],
        }));
      },
      error: (err) => console.error('Charity add failed:', err),
    });
  }

  updateCharity(index: number, updates: Partial<ICharity>) {
    this._clientdata.update((current) => ({
      ...current,
      charities: current.charities.map((charity, i) =>
        i === index ? { ...charity, ...updates } : charity,
      ),
    }));

    const charity = this._clientdata().charities[index];
    this.saveClientSection(
      'charity',
      {
        ...charity,
        action: 'update',
        portal_user_id: this.pui,
      },
      'charity_id',
    ).subscribe({
      next: (response) => console.log('Charity saved:', response),
      error: (err) => console.error('Charity save failed:', err),
    });
  }

  removeCharity(index: number) {
    const charity = this._clientdata().charities[index];

    this._clientdata.update((current) => ({
      ...current,
      charities: current.charities.filter((_, i) => i !== index),
    }));

    this.saveClientSection(
      'charity',
      {
        charity_id: charity.charity_id,
        portal_user_id: this.pui,
        action: 'delete',
      },
      'charity_id',
    ).subscribe({
      next: (response) => console.log('Charity deleted:', response),
      error: (err) => console.error('Charity delete failed:', err),
    });
  }

  // Methods for managing assets
  /**
   * Returns an array of all possible heirs for the client: spouse, children, family members, charities.
   * Each entry: { id, name, type }
   */

  getClientHeirsArray(): Array<{ id: string; name: string; type: string }> {
    const data = this._clientdata();
    const heirs: Array<{ id: string; name: string; type: string }> = [];

    // Spouse
    if (
      data.marital_info &&
      data.marital_info.marital_status === 'Married' &&
      data.marital_info.spouse_legal_name
    ) {
      heirs.push({
        id: 'spouse',
        name: data.marital_info.spouse_legal_name,
        type: 'Spouse',
      });
    }

    // Children (only with valid id)
    if (Array.isArray(data.children)) {
      data.children.forEach((child) => {
        if (child.child_id != null) {
          heirs.push({
            id: `child_${child.child_id}`,
            name: [
              child.legal_first_name,
              child.legal_middle_name,
              child.legal_last_name,
            ]
              .filter(Boolean)
              .join(' '),
            type: 'Child',
          });
        }
      });
    }

    // Family Members (only with valid id)
    if (Array.isArray(data.family_members)) {
      data.family_members.forEach((member) => {
        if (member.family_member_id != null) {
          heirs.push({
            id: `family_member_${member.family_member_id}`,
            name: member.legal_name,
            type: 'FamilyMember',
          });
        }
      });
    }

    // Charities (only with valid id)
    if (Array.isArray(data.charities)) {
      data.charities.forEach((charity) => {
        if (charity.charity_id != null) {
          heirs.push({
            id: `charity_${charity.charity_id}`,
            name: charity.organization_name,
            type: 'Charity',
          });
        }
      });
    }

    return heirs;
  }

  /**
   * Returns an array of all possible heirs for the spouse: client, children, family members, charities.
   * Each entry: { id, name, type }
   * If not married, returns empty array.
   */

  getSpouseHeirsArray(): Array<{ id: string; name: string; type: string }> {
    const data = this._clientdata();
    const heirs: Array<{ id: string; name: string; type: string }> = [];

    // Only if married
    if (
      !(
        data.marital_info &&
        data.marital_info.marital_status === 'Married' &&
        data.marital_info.spouse_legal_name
      )
    ) {
      return heirs;
    }

    // Client (as husband or wife or just name)
    const clientName = [
      data.personal.legal_first_name,
      data.personal.legal_middle_name,
      data.personal.legal_last_name,
    ]
      .filter(Boolean)
      .join(' ');
    heirs.push({
      id: 'client',
      name: clientName,
      type: 'Client',
    });

    // Children (only with valid id)
    if (Array.isArray(data.children)) {
      data.children.forEach((child) => {
        if (child.child_id != null) {
          heirs.push({
            id: `child_${child.child_id}`,
            name: [
              child.legal_first_name,
              child.legal_middle_name,
              child.legal_last_name,
            ]
              .filter(Boolean)
              .join(' '),
            type: 'Child',
          });
        }
      });
    }

    // Family Members (only with valid id)
    if (Array.isArray(data.family_members)) {
      data.family_members.forEach((member) => {
        if (member.family_member_id != null) {
          heirs.push({
            id: `family_member_${member.family_member_id}`,
            name: member.legal_name,
            type: 'FamilyMember',
          });
        }
      });
    }

    // Charities (only with valid id)
    if (Array.isArray(data.charities)) {
      data.charities.forEach((charity) => {
        if (charity.charity_id != null) {
          heirs.push({
            id: `charity_${charity.charity_id}`,
            name: charity.organization_name,
            type: 'Charity',
          });
        }
      });
    }

    return heirs;
  }
  addRealEstate(
    asset: Partial<IRealEstate> & { description?: string; value?: number },
  ) {
    // Prepare payload matching MariaDB table columns
    const payload = {
      real_estate_id: null,
      portal_user_id: this.pui,
      description: asset.description ?? '',
      value: asset.value ?? null,
      property_type: asset.property_type ?? '',
      address_line1: asset.address_line1 ?? '',
      address_line2: asset.address_line2 ?? '',
      city: asset.city ?? '',
      state: asset.state ?? '',
      zip: asset.zip ?? '',
      dispo_type: asset.ownership_form ?? '', // send dispo_type to backend
      title_details: asset.title_details ?? '',
      approximate_value: asset.approximate_value ?? null,
      mortgage_balance: asset.mortgage_balance ?? null,
      net_value: asset.net_value ?? null,
      beneficiaries_on_deed: asset.beneficiaries_on_deed ?? '',
      intended_beneficiary: asset.intended_beneficiary ?? '',
      special_notes: asset.special_notes ?? '',
      owned_by: asset.owned_by ?? '',
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? '',
      ownership_value: asset.ownership_value ?? null,
      action: 'insert',
    };
    // Save to backend
    this.saveClientSection('real_estate_holdings', payload).subscribe();
    // Update local state with a fully-typed IRealEstate object
    const localAsset: IRealEstate = {
      real_estate_id: null,
      property_type: asset.property_type ?? 'other',
      address_line1: asset.address_line1 ?? '',
      address_line2: asset.address_line2 ?? null,
      city: asset.city ?? '',
      state: asset.state ?? '',
      zip: asset.zip ?? '',
      ownership_form: asset.ownership_form ?? 'Other',
      title_details: asset.title_details ?? null,
      approximate_value: asset.approximate_value ?? null,
      mortgage_balance: asset.mortgage_balance ?? null,
      net_value: asset.net_value ?? null,
      beneficiaries_on_deed: asset.beneficiaries_on_deed ?? null,
      intended_beneficiary: asset.intended_beneficiary ?? null,
      special_notes: asset.special_notes ?? null,
      owned_by: asset.owned_by ?? null,
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? null,
      ownership_value: asset.ownership_value ?? null,
      has_bene: asset.has_bene ?? 'No',
      primary_beneficiaries: asset.primary_beneficiaries ?? [],
      contingent_beneficiaries: asset.contingent_beneficiaries ?? [],
    };
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: [
          ...current.assets.real_estate_holdings,
          localAsset,
        ],
      },
    }));
  }

  updateRealEstate(asset: IRealEstate) {
    const realEstateId = (asset as any).real_estate_id;
    if (!realEstateId) {
      console.warn('Cannot update: real_estate real_estate_id is missing.');
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      real_estate_id: realEstateId,
    };
    this.saveClientSection('real_estate_holdings', updatedAsset).subscribe();
    // Update local state by real_estate_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: current.assets.real_estate_holdings.map((a) =>
          a.real_estate_id === realEstateId ? { ...a, ...asset } : a,
        ),
      },
    }));
  }

  removeRealEstate(index: number) {
    const asset = this._clientdata().assets.real_estate_holdings[index];
    const realEstateId = (asset as any).real_estate_id;
    if (!asset.real_estate_id) {
      console.warn('Cannot delete: real_estate real_estate_id is missing.');
      return;
    }
    this.saveClientSection('real_estate_holdings', {
      asset_id_type: 'real_estate_id',
      id: asset.real_estate_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        real_estate_holdings: current.assets.real_estate_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  addBankAccount(
    asset: Partial<IBankAccount> & {
      institution_name?: string;
      account_number?: string;
      balance?: number;
    },
  ) {
    // Prepare payload matching MariaDB table columns
    const payload = {
      bank_account_id: null,
      portal_user_id: this.pui,
      account_number: asset.account_number ?? '',
      balance: asset.balance ?? null,
      institution_name: asset.institution_name ?? '',
      account_type: asset.account_type ?? '',
      account_number_encrypted: asset.account_number_encrypted ?? '',
      approximate_value: asset.approximate_value ?? null,
      joint_owner_name: asset.joint_owner_name ?? '',
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
      dispo_type: asset.ownership_form ?? null, // send dispo_type to backend
      notes: asset.notes ?? '',
      owned_by: asset.owned_by ?? '',
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? '',
      action: 'insert',
    };
    // Save to backend
    this.saveClientSection('bank_account_holdings', payload).subscribe();
    // Update local state with a fully-typed IBankAccount object
    const localAsset: IBankAccount = {
      bank_account_id: null,
      institution_name: asset.institution_name ?? '',
      account_type: asset.account_type ?? 'Checking',
      account_number_encrypted: asset.account_number_encrypted ?? null,
      approximate_value: asset.approximate_value ?? null,
      balance: asset.balance ?? undefined,
      joint_owner_name: asset.joint_owner_name ?? null,
      primary_beneficiaries: asset.primary_beneficiaries ?? [],
      contingent_beneficiaries: asset.contingent_beneficiaries ?? [],
      ownership_form: asset.ownership_form ?? null,
      notes: asset.notes ?? null,
      owned_by: asset.owned_by ?? null,
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? null,
      has_bene: asset.has_bene ?? 'No',
    };
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: [
          ...current.assets.bank_account_holdings,
          localAsset,
        ],
      },
    }));
  }

  /**
   * Update a bank account holding in MariaDB
   */
  updateBankAccount(asset: IBankAccount) {
    if (!asset.bank_account_id) {
      console.warn('Cannot update: bank_account account_id is missing.');
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      bank_account_id: asset.bank_account_id,
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
    };
    this.saveClientSection('bank_account_holdings', updatedAsset).subscribe();
    // Update local state by account_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: current.assets.bank_account_holdings.map((a) =>
          a.bank_account_id === asset.bank_account_id ? { ...a, ...asset } : a,
        ),
      },
    }));
  }

  removeBankAccount(index: number) {
    const asset = this._clientdata().assets.bank_account_holdings[index];
    if (!asset.bank_account_id) {
      console.warn('Cannot delete: bank_account account_id is missing.');
      return;
    }
    this.saveClientSection('bank_account_holdings', {
      asset_id_type: 'account_id',
      id: asset.bank_account_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        bank_account_holdings: current.assets.bank_account_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  // --- NQ Account CRUD ---
  addNQAccount(asset: Partial<INQAccount>) {
    const payload = {
      nq_account_id: null,
      portal_user_id: this.pui,
      account_name: asset.account_name ?? '',
      balance: asset.balance ?? undefined,
      institution_name: asset.institution_name ?? '',
      account_type: asset.account_type ?? 'Mutual Fund',
      account_number_encrypted: asset.account_number_encrypted ?? '',
      approximate_value: asset.approximate_value ?? null,
      joint_owner_name: asset.joint_owner_name ?? '',
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
      dispo_type: asset.ownership_form ?? null, // send dispo_type to backend
      notes: asset.notes ?? '',
      owned_by: asset.owned_by ?? null,
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? null,
      action: 'insert',
    };
    this.saveClientSection('nq_account_holdings', payload).subscribe();
    // Update local state with a fully-typed INQAccount object
    const localAsset: INQAccount = {
      nq_account_id: null,
      account_name: asset.account_name ?? '',
      balance: asset.balance ?? null,
      institution_name: asset.institution_name ?? '',
      account_type: asset.account_type ?? 'Mutual Fund',
      account_number_encrypted: asset.account_number_encrypted ?? null,
      approximate_value: asset.approximate_value ?? null,
      joint_owner_name: asset.joint_owner_name ?? '',
      primary_beneficiaries: asset.primary_beneficiaries ?? [],
      contingent_beneficiaries: asset.contingent_beneficiaries ?? [],
      ownership_form: asset.ownership_form ?? null,
      notes: asset.notes ?? null,
      owned_by: asset.owned_by ?? null,
      ownership_percentage: asset.ownership_percentage ?? null,
      other_owners: asset.other_owners ?? null,
      has_bene: asset.has_bene ?? 'No',
    };
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: [
          ...current.assets.nq_account_holdings,
          localAsset,
        ],
      },
    }));
  }

  updateNQAccount(asset: INQAccount) {
    if (!asset.nq_account_id) {
      console.warn('Cannot update: nq_account account_id is missing.');
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      nq_account_id: asset.nq_account_id,
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
    };
    this.saveClientSection('nq_account_holdings', updatedAsset).subscribe();
    // Update local state by account_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: current.assets.nq_account_holdings.map((a) =>
          a.nq_account_id === asset.nq_account_id ? { ...a, ...asset } : a,
        ),
      },
    }));
  }

  removeNQAccount(index: number) {
    const asset = this._clientdata().assets.nq_account_holdings[index];
    if (!asset.nq_account_id) {
      console.warn('Cannot delete: nq_account account_id is missing.');
      return;
    }
    this.saveClientSection('nq_account_holdings', {
      asset_id_type: 'account_id',
      id: asset.nq_account_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        nq_account_holdings: current.assets.nq_account_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  // --- Retirement Account CRUD ---
  addRetirementAccount(asset: Partial<IRetirementAccount>) {
    const payload = {
      ...asset,
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
      dispo_type: asset.ownership_form ?? null, // send dispo_type to backend
      retirement_account_id: null,
      portal_user_id: this.pui,
      action: 'insert',
    };
    this.saveClientSection('retirement_account_holdings', payload).subscribe();
    const localAsset: IRetirementAccount = {
      ...asset,
      ownership_form: asset.ownership_form ?? null,
    } as IRetirementAccount;
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings: [
          ...current.assets.retirement_account_holdings,
          localAsset,
        ],
      },
    }));
  }

  updateRetirementAccount(asset: IRetirementAccount) {
    if (!asset.retirement_account_id) {
      console.warn(
        'Cannot update: retirement_account retirement_account_id is missing.',
      );
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      retirement_account_id: asset.retirement_account_id,
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
    };
    this.saveClientSection(
      'retirement_account_holdings',
      updatedAsset,
    ).subscribe();
    // Update local state by retirement_account_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings:
          current.assets.retirement_account_holdings.map((a) =>
            a.retirement_account_id === asset.retirement_account_id
              ? { ...a, ...asset }
              : a,
          ),
      },
    }));
  }

  removeRetirementAccount(index: number) {
    const asset = this._clientdata().assets.retirement_account_holdings[index];
    if (!asset.retirement_account_id) {
      console.warn(
        'Cannot delete: retirement_account retirement_account_id is missing.',
      );
      return;
    }
    this.saveClientSection('retirement_account_holdings', {
      asset_id_type: 'retirement_account_id',
      id: asset.retirement_account_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        retirement_account_holdings:
          current.assets.retirement_account_holdings.filter(
            (_, i) => i !== index,
          ),
      },
    }));
  }

  addLifeInsurance(asset: ILifeInsurance) {
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: [
          ...current.assets.life_insurance_holdings,
          asset,
        ],
      },
    }));
  }

  updateLifeInsurance(asset: ILifeInsurance) {
    if (!asset.life_insurance_id) {
      console.warn(
        'Cannot update: life_insurance life_insurance_id is missing.',
      );
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      life_insurance_id: asset.life_insurance_id,
      primary_beneficiaries: Array.isArray(asset.primary_beneficiaries)
        ? JSON.stringify(asset.primary_beneficiaries)
        : (asset.primary_beneficiaries ?? ''),
      contingent_beneficiaries: Array.isArray(asset.contingent_beneficiaries)
        ? JSON.stringify(asset.contingent_beneficiaries)
        : (asset.contingent_beneficiaries ?? ''),
    };
    this.saveClientSection('life_insurance_holdings', updatedAsset).subscribe();
    // Update local state by life_insurance_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: current.assets.life_insurance_holdings.map(
          (a) =>
            a.life_insurance_id === asset.life_insurance_id
              ? { ...a, ...asset }
              : a,
        ),
      },
    }));
  }

  removeLifeInsurance(index: number) {
    const asset = this._clientdata().assets.life_insurance_holdings[index];
    if (!asset.life_insurance_id) {
      console.warn(
        'Cannot delete: life_insurance life_insurance_id is missing.',
      );
      return;
    }
    this.saveClientSection('life_insurance_holdings', {
      asset_id_type: 'life_insurance_id',
      id: asset.life_insurance_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        life_insurance_holdings: current.assets.life_insurance_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  addBusinessInterest(asset: IBusinessInterest) {
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings: [
          ...current.assets.business_interest_holdings,
          asset,
        ],
      },
    }));
  }

  updateBusinessInterest(asset: IBusinessInterest) {
    if (!asset.business_interest_id) {
      console.warn(
        'Cannot update: business_interest business_interest_id is missing.',
      );
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      business_interest_id: asset.business_interest_id,
    };
    this.saveClientSection(
      'business_interest_holdings',
      updatedAsset,
    ).subscribe();
    // Update local state by business_interest_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings:
          current.assets.business_interest_holdings.map((a) =>
            a.business_interest_id === asset.business_interest_id
              ? { ...a, ...asset }
              : a,
          ),
      },
    }));
  }

  removeBusinessInterest(index: number) {
    const asset = this._clientdata().assets.business_interest_holdings[index];
    if (!asset.business_interest_id) {
      console.warn(
        'Cannot delete: business_interest business_interest_id is missing.',
      );
      return;
    }
    this.saveClientSection('business_interest_holdings', {
      asset_id_type: 'business_interest_id',
      id: asset.business_interest_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        business_interest_holdings:
          current.assets.business_interest_holdings.filter(
            (_, i) => i !== index,
          ),
      },
    }));
  }

  addDigitalAsset(asset: IDigitalAsset) {
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: [
          ...current.assets.digital_asset_holdings,
          asset,
        ],
      },
    }));
  }

  updateDigitalAsset(asset: IDigitalAsset) {
    if (!asset.digital_asset_id) {
      console.warn('Cannot update: digital_asset digital_asset_id is missing.');
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      digital_asset_id: asset.digital_asset_id,
    };
    this.saveClientSection('digital_asset_holdings', updatedAsset).subscribe();
    // Update local state by digital_asset_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: current.assets.digital_asset_holdings.map(
          (a) =>
            a.digital_asset_id === asset.digital_asset_id
              ? { ...a, ...asset }
              : a,
        ),
      },
    }));
  }

  removeDigitalAsset(index: number) {
    const asset = this._clientdata().assets.digital_asset_holdings[index];
    if (!asset.digital_asset_id) {
      console.warn('Cannot delete: digital_asset digital_asset_id is missing.');
      return;
    }
    this.saveClientSection('digital_asset_holdings', {
      asset_id_type: 'digital_asset_id',
      id: asset.digital_asset_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        digital_asset_holdings: current.assets.digital_asset_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  addOtherAsset(asset: IOtherAsset) {
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: [...current.assets.other_asset_holdings, asset],
      },
    }));
  }

  updateOtherAsset(asset: IOtherAsset) {
    if (!asset.other_asset_id) {
      console.warn('Cannot update: other_asset other_asset_id is missing.');
      return;
    }
    const updatedAsset = {
      ...asset,
      action: 'update',
      asset_id: asset.other_asset_id,
    };
    this.saveClientSection('other_asset_holdings', updatedAsset).subscribe();
    // Update local state by other_asset_id
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: current.assets.other_asset_holdings.map((a) =>
          a.other_asset_id === asset.other_asset_id ? { ...a, ...asset } : a,
        ),
      },
    }));
  }

  removeOtherAsset(index: number) {
    const asset = this._clientdata().assets.other_asset_holdings[index];
    if (!asset.other_asset_id) {
      console.warn('Cannot delete: other_asset other_asset_id is missing.');
      return;
    }
    this.saveClientSection('other_asset_holdings', {
      asset_id_type: 'other_asset_id',
      id: asset.other_asset_id,
      action: 'delete',
    }).subscribe();
    this._clientdata.update((current) => ({
      ...current,
      assets: {
        ...current.assets,
        other_asset_holdings: current.assets.other_asset_holdings.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }
  // Template objects for creating new instances
  public address: IAddress = {
    address_line1: '',
    address_line2: null,
    city: '',
    state: '',
    zip: '',
  };

  public previousMarriage: IPreviousMarriage = {
    spouse_name: '',
    marriage_date: null,
    divorce_date: null,
    location: '',
  };

  public fiduciary: IFiduciary = {
    appointment_id: null,
    role_type: 'Executor',
    priority: 'Primary',
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
    effective_immediately: null,
  };

  public child: IChild = {
    child_id: null,
    legal_first_name: '',
    legal_middle_name: null,
    legal_last_name: '',
    suffix: null,
    date_of_birth: null,
    child_of: 'Both',
    child_comment: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    marital_status: null,
    has_children: false,
    relationship_quality: null,
    financially_responsible: null,
    haveConcerns: 'No',
    concern_ids: [],
    concern_notes: null,
    excluded_or_reduced: false,
    exclusion_reason: null,
    is_deceased: false,
    date_of_death: null,
    surviving_spouse: null,
  };

  public familyMember: IFamilyMember = {
    family_member_id: null,
    relationship: 'Grandchild',
    legal_name: '',
    date_of_birth: null,
    is_living: true,
    date_of_death: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    haveConcerns: 'No',
    concern_ids: [],
    concern_notes: null,
    notes: null,
  };

  public guardianPreferences: IGuardianPreferences = {
    preference_id: null,
    child_raising_values: null,
    location_importance: null,
    religious_upbringing_preferences: null,
    education_priorities: null,
    other_preferences: null,
  };

  public beneficiary: IBeneficiary = {
    beneficiary_id: null,
    beneficiary_type: 'Child',
    name: '',
    child_id: null,
    spouse_id: null,
    family_member_id: null,
    other_name: null,
    percentage: 0,
    calculated_value: null,
    per_stirpes: false,
    notes: null,
  };

  public realEstate: IRealEstate = {
    real_estate_id: null,
    property_type: 'primary_residence',
    address_line1: '',
    address_line2: null,
    city: '',
    state: '',
    zip: '',
    ownership_form: 'Sole Ownership',
    title_details: null,
    approximate_value: 0,
    mortgage_balance: 0,
    net_value: 0,
    beneficiaries_on_deed: null,
    intended_beneficiary: null,
    special_notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    ownership_value: null,
    has_bene: 'No',
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
  };

  public bankAccount: IBankAccount = {
    bank_account_id: null,
    institution_name: '',
    account_type: 'Checking',
    account_number_encrypted: null,
    approximate_value: 0,
    balance: 0,
    joint_owner_name: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    ownership_form: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    has_bene: 'No',
  };

  public nqAccount: INQAccount = {
    nq_account_id: null,
    account_name: '',
    balance: null,
    institution_name: '',
    account_type: 'Mutual Fund',
    account_number_encrypted: null,
    approximate_value: 0,
    joint_owner_name: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    ownership_form: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    has_bene: 'No',
  };

  public retirementAccount: IRetirementAccount = {
    retirement_account_id: null,
    account_name: '',
    balance: null,
    account_type: '401k',
    institution_name: '',
    account_number_encrypted: null,
    approximate_value: 0,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    rmd_age_reached: false,
    ownership_form: null,
    notes: null,
    owned_by: null,
    has_bene: 'Yes',
  };

  public businessInterest: IBusinessInterest = {
    business_interest_id: null,
    business_name: '',
    business_type: 'LLC',
    ownership_percentage: null,
    approximate_value: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    has_other_owners: false,
    other_owners_names: null,
    buy_sell_agreement_exists: false,
    buy_sell_document_id: null,
    succession_plan_exists: false,
    business_vision_after_death: null,
    intended_successor: null,
    successor_is_family: null,
    should_business_be_sold: null,
    ownership_form: null,
    notes: null,
    owned_by: null,
    other_owners: null,
    has_bene: 'No',
  };

  public lifeInsurance: ILifeInsurance = {
    life_insurance_id: null,
    insurance_company: '',
    policy_type: 'Term',
    policy_number: null,
    face_value: 0,
    approximate_value: 0, //death_benefit
    cash_value: 0,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    owned_by_trust: false,
    trust_name: null,
    annual_premium: 0,
    ownership_form: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    has_bene: 'Yes',
  };

  public digitalAsset: IDigitalAsset = {
    digital_asset_id: null,
    asset_type: 'Other',
    asset_name: '',
    platform_or_service: null,
    approximate_value: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    username: null,
    access_location: null,
    wallet_type: null,
    seed_phrase_location: null,
    intended_disposition: null,
    access_instructions: null,
    ownership_form: null,
    notes: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    has_bene: 'No',
  };

  public otherAsset: IOtherAsset = {
    other_asset_id: null,
    asset_type: 'Other',
    description: '',
    approximate_value: null,
    primary_beneficiaries: [],
    contingent_beneficiaries: [],
    debtOwed: 0,
    netValue: null,
    is_heirloom: false,
    intended_recipient: null,
    special_instructions: null,
    appraisal_exists: false,
    appraisal_date: null,
    owned_by: null,
    ownership_percentage: null,
    other_owners: null,
    ownership_form: null,
    notes: null,
    has_bene: 'No',
  };

  /**
   * Holds the portal_user_id for use in updates
   */

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
        portal_user_id: this.authService.getCurrentUserId(),
        status: null,
        completion_percentage: 0,
        assigned_attorney_id: null,
        office: null,
        referral_source: null,
      },
      personal: {
        personal_id: null,
        legal_first_name: '',
        legal_middle_name: null,
        legal_last_name: '',
        suffix: null,
        homestate: null,
        homestateother: null,
        sex: null,
        date_of_birth: null,
        ssn_encrypted: null,
        us_citizen: 'Yes',
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
        preferred_contact_method: 'Email',
        occupation: null,
        employer_name: null,
        employer_address: null,
        military_service: 'No',
        military_branch: null,
        military_service_dates: null,
      },
      marital_info: {
        marital_id: null,
        marital_status: 'Single',
        spouse_legal_name: null,
        spouse_dob: null,
        spouse_ssn_encrypted: null,
        spouse_sex: null,
        marriage_date: null,
        marriage_location: null,
        first_marriage: null,
        occupation: null,
        employer_name: null,
        employer_address: null,
        mobile_phone: null,
        home_phone: null,
        email: null,
        preferred_contact_method: 'Email',
        prenup_exists: null,
        prenup_document_id: null,
        postnup_exists: null,
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
      debts: [],
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
      this._clientdata.update((current) => ({
        ...current,
        client: {
          ...current.client,
          client_id: userId,
        },
      }));

      // Load existing client data for this user
      this.loadClientData().subscribe({
        next: (clientData) => {
          if (clientData) {
            this.pui = clientData.client.portal_user_id;
            this._clientdata.set(clientData);

            if (
              clientData &&
              clientData.client &&
              clientData.client.client_id
            ) {
              this.pui = clientData.client.client_id;
            }
          }
        },
        error: (error) => {
          console.warn('Could not load existing client data:', error);
        },
      });
    }
  }

  /**
   * Load all client data (including beneficiaries) from server for current user
   */
  loadClientData(): Observable<IClientData | null> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<IClientData>(`${this.API_URL}?id=${userId}`).pipe(
      map((response) => {
        if (!response) return null;
        let data = this.convertBooleans(response);
        data = this.parseJsonFields(data);
        return data;
      }),
      catchError((error) => {
        if (error.status === 404) {
          return [null];
        }
        throw error;
      }),
    );
  }

  private parseJsonFields(data: IClientData): IClientData {
    // Parse beneficiary arrays in all asset types that have them
    const assetHoldings = [
      'bank_account_holdings',
      'nq_account_holdings',
      'retirement_account_holdings',
      'life_insurance_holdings',
      'business_interest_holdings',
      'digital_asset_holdings',
    ];

    if (data.assets) {
      for (const holdingType of assetHoldings) {
        const holdings = (data.assets as any)[holdingType];
        if (Array.isArray(holdings)) {
          for (const asset of holdings) {
            asset.primary_beneficiaries = this.parseJsonArray(
              asset.primary_beneficiaries,
            );
            asset.contingent_beneficiaries = this.parseJsonArray(
              asset.contingent_beneficiaries,
            );
          }
        }
      }
    }

    return data;
  }

  private parseJsonArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  convertBooleans(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertBooleans(item));
    } else if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (this.booleanFields.includes(key)) {
          // Accept 0, "0", null, undefined as false; 1, "1" as true
          newObj[key] = obj[key] === 1 || obj[key] === '1' ? true : false;
        } else {
          newObj[key] = this.convertBooleans(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  }

  /** CRUD for Debts
   * Add, Update, Remove methods for debts can be implemented here
   */
  /**
   * Refresh debts from backend and update local signal
   */
  public refreshDebts(): void {
    this.loadClientData().subscribe({
      next: (clientData) => {
        if (clientData && Array.isArray(clientData.debts)) {
          this._clientdata.update((current) => ({
            ...current,
            debts: clientData.debts,
          }));
        }
      },
      error: (error) => {
        console.error('Failed to refresh debts:', error);
      },
    });
  }

  /**
   * Send targeted request to clientupdate.php for debts
   */
  saveDebt(
    action: 'insert' | 'update' | 'delete',
    debt: IDebt,
  ): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return throwError(() => new Error('User not authenticated'));
    let payload: any = {
      table: 'debt',
      action,
      data: { ...debt, portal_user_id: userId },
    };
    if (action !== 'insert' && debt.debt_id) {
      payload.asset_id_type = 'debt_id';
      payload.debt_id = debt.debt_id;
    }
    return this.http.post(this.UPDATE_URL, payload);
  }

  /**
   * Save case data to server
   */
  saveclientdata(): Observable<IClientData> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      // Silently skip saving if no user is authenticated
      return new Observable<IClientData>((observer) => {
        observer.complete();
      });
    }

    const clientData = this._clientdata();
    const dataToSave = {
      ...clientData,
      client: {
        ...clientData.client,
        client_id: userId,
      },
      personal: {
        ...clientData.personal,
        client_id: userId,
      },
      marital_info: {
        ...clientData.marital_info,
        client_id: userId,
      },
      guardianship_preferences: {
        ...clientData.guardianship_preferences,
        client_id: userId,
      },
    };

    // Save the full client data object (POST to clientdata.php)
    return this.http.post<IClientData>(
      `${this.API_URL}?id=${userId}`,
      dataToSave,
    );
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
          this._clientdata.set(savedData as IClientData);
        },
        error: (error) => {
          console.error('Auto-save failed:', error);
        },
      });
    }, 2000);
  }

  /**
   * Update a real estate holding in MariaDB
   */
  readonly isMarried = computed(() => {
    const status = this.maritalInfo()?.marital_status;
    return status === 'Married' || status === 'Domestic_partnership';
  });
}
