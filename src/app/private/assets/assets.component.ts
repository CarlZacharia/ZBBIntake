
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import {
  IRealEstate,
  IBankAccount,
  INQAccount,
  IRetirementAccount,
  ILifeInsurance,
  IBusinessInterest,
  IDigitalAsset,
  IOtherAsset,
  IBeneficiary
} from '../../models/case_data';

import { BeneficiaryDesignationComponent } from '../beneficiary-designation/beneficiary-designation.component';

type AssetType = 'real_estate_holdings' | 'bank_account_holdings' | 'nq_account_holdings' | 'retirement_account_holdings' | 'life_insurance_holdings' | 'business_interest_holdings' | 'digital_asset_holdings' | 'other_asset_holdings';

@Component({
  selector: 'app-assets',
  imports: [CommonModule, FormsModule, BeneficiaryDesignationComponent],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent {

    // Grouped asset and debt properties for table rendering
    get assetsGroups() {
      const assets = this.assets();
      return {
        real_estate_holdings: assets.real_estate_holdings || [],
        bank_account_holdings: assets.bank_account_holdings || [],
        nq_account_holdings: assets.nq_account_holdings || [],
        retirement_account_holdings: assets.retirement_account_holdings || [],
        life_insurance_holdings: assets.life_insurance_holdings || [],
        business_interest_holdings: assets.business_interest_holdings || [],
        digital_asset_holdings: assets.digital_asset_holdings || [],
        other_asset_holdings: assets.other_asset_holdings || []
      };
    }

    // Debts from DataService
    get debts() {
      return this.ds.debts();
    }
  // Auto-calculate netValue for real estate
  onRealEstateValueChange() {
    if (this.editingRealEstate) {
      const est = Number(this.editingRealEstate.approximate_value) || 0;
      const mort = Number(this.editingRealEstate.mortgage_balance) || 0;
      this.editingRealEstate.net_value = est - mort;
    }
  }

  // Auto-calculate netValue for other assets
  onOtherAssetValueChange() {
    if (this.editingOtherAsset) {
      const est = Number(this.editingOtherAsset.approximate_value) || 0;
      const debt = Number(this.editingOtherAsset.debtOwed) || 0;
      this.editingOtherAsset.netValue = est - debt;
    }
  }

  // Modal visibility flags
  showAddModal = false;
  showEditModal = false;
  currentAssetType: AssetType | null = null;


  // Editing asset references
  editingRealEstate: IRealEstate | null = null;
  editingBankAccount: IBankAccount | null = null;
  editingNQAccount: INQAccount | null = null;
  editingRetirementAccount: IRetirementAccount | null = null;
  editingLifeInsurance: ILifeInsurance | null = null;
  editingBusinessInterest: IBusinessInterest | null = null;
  editingDigitalAsset: IDigitalAsset | null = null;
  editingOtherAsset: IOtherAsset | null = null;
  editingIndex: number = -1;

  // Reactive data access
  readonly assets = computed(() => this.ds.assets());
  readonly maritalInfo = computed(() => this.ds.maritalInfo());
  readonly isMarriedSignal = computed(() => this.maritalInfo().marital_status === 'Married');

  // US States for dropdowns
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  showTable: 'single' | 'married' | 'default' = 'default';

  constructor(public ds: DataService) {
    this.showTable = 'default';
  }

  // Backwards compatibility
  get isMarried(): boolean {
    return this.isMarriedSignal();
  }


    formatCurrency(value: number): string {
      if (isNaN(value) || value == null) return '$0';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
  // --- Asset Filtering Methods ---

  getClientAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, 'Client');
  }

  getSpouseAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, 'Spouse');
  }

  getJointAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, null);
  }

  getAllAssets(assetType: string): any[] {
    const assets = this.assets();
    switch (assetType) {
      case 'real_estate_holdings': return assets.real_estate_holdings;
      case 'bank_account_holdings': return assets.bank_account_holdings || [];
      case 'nq_account_holdings': return assets.nq_account_holdings || [];
      case 'retirement_account_holdings': return assets.retirement_account_holdings;
      case 'life_insurance_holdings': return assets.life_insurance_holdings;
      case 'business_interest_holdings': return assets.business_interest_holdings;
      case 'digital_asset_holdings': return assets.digital_asset_holdings;
      case 'other_asset_holdings': return assets.other_asset_holdings;
      default: return [];
    }
  }

  private getAssetsByOwnership(assetType: string, ownership: 'Client' | 'Spouse' |null): any[] {
    const allAssets = this.getAllAssets(assetType);
     if (ownership === null) {
      // Joint assets are those without owned_by set
      return allAssets.filter((asset: any) => !asset.owned_by);
    }
    return allAssets.filter((asset: any) => asset.owned_by === ownership);
  }

  // --- Total Calculation Methods ---

  getTotalValue(assetType: string, ownership?: 'Client' | 'Spouse' |null): number {
    const assets = ownership !== undefined
      ? this.getAssetsByOwnership(assetType, ownership)
      : this.getAllAssets(assetType);

    return assets.reduce((total, asset) => {
      let value = 0;
      // Always coerce approximate_value to number
      switch (assetType) {
        case 'real_estate_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'bank_account_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'nq_account_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'retirement_account_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'life_insurance_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'business_interest_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'digital_asset_holdings':
          value = +asset.approximate_value || 0;
          break;
        case 'other_asset_holdings':
          // Use netValue if present, else approximate_value
          value = (asset.netValue != null ? +asset.netValue : +asset.approximate_value) || 0;
          break;
      }
      return total + value;
    }, 0);
  }

  getGrandTotal(ownership?: 'Client' | 'Spouse' |null): number {
    const types: AssetType[] = ['real_estate_holdings', 'bank_account_holdings', 'nq_account_holdings', 'retirement_account_holdings', 'life_insurance_holdings', 'business_interest_holdings', 'digital_asset_holdings', 'other_asset_holdings'];
    const total = types.reduce((sum, type) => {
      const val = this.getTotalValue(type, ownership);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return isNaN(total) ? 0 : total;
  }

  // --- Modal Methods ---

  openAddModal(assetType: AssetType) {
    this.currentAssetType = assetType;
    this.initializeEditingAsset(assetType);
    this.showAddModal = true;
  }

  openEditModal(assetType: AssetType, index: number, ownership?: 'Client' | 'Spouse' |null) {
    this.currentAssetType = assetType;
    this.editingIndex = index;

    let asset;
    if (ownership !== undefined) {
      const assets = this.getAssetsByOwnership(assetType, ownership);
      asset = assets[index];
      // Find the actual index in the full array
      const allAssets = this.getAllAssets(assetType);
      this.editingIndex = allAssets.indexOf(asset);
    } else {
      const allAssets = this.getAllAssets(assetType);
      asset = allAssets[index];
    }

    this.setEditingAsset(assetType, { ...asset });
    this.showEditModal = true;
  }



  private initializeEditingAsset(assetType: AssetType) {
    switch (assetType) {
      case 'real_estate_holdings':
        this.editingRealEstate = { ...this.ds.realEstate };
        break;
      case 'bank_account_holdings':
        this.editingBankAccount = { ...this.ds.bankAccount };
        break;
      case 'nq_account_holdings':
        this.editingNQAccount = { ...this.ds.nqAccount };
        break;
      case 'retirement_account_holdings':
        this.editingRetirementAccount = { ...this.ds.retirementAccount };
        break;
      case 'life_insurance_holdings':
        this.editingLifeInsurance = { ...this.ds.lifeInsurance };
        break;
      case 'business_interest_holdings':
        this.editingBusinessInterest = { ...this.ds.businessInterest };
        break;
      case 'digital_asset_holdings':
        this.editingDigitalAsset = { ...this.ds.digitalAsset };
        break;
      case 'other_asset_holdings':
        this.editingOtherAsset = { ...this.ds.otherAsset };
        break;
    }
  }

  private setEditingAsset(assetType: AssetType, asset: any) {
    switch (assetType) {
      case 'real_estate_holdings':
        this.editingRealEstate = asset;
        break;
      case 'bank_account_holdings':
        this.editingBankAccount = asset;
        break;
      case 'nq_account_holdings':
        this.editingNQAccount = asset;
        break;
      case 'retirement_account_holdings':
        this.editingRetirementAccount = asset;
        break;
      case 'life_insurance_holdings':
        this.editingLifeInsurance = asset;
        break;
      case 'business_interest_holdings':
        this.editingBusinessInterest = asset;
        break;
      case 'digital_asset_holdings':
        this.editingDigitalAsset = asset;
        break;
      case 'other_asset_holdings':
        this.editingOtherAsset = asset;
        break;
    }
  }

  saveNewAsset() {
    if (!this.currentAssetType) return;

    const asset = this.getCurrentEditingAsset();
    if (!asset) return;

    switch (this.currentAssetType) {
      case 'real_estate_holdings':
        this.ds.addRealEstate(asset as IRealEstate);
        break;
      case 'bank_account_holdings':
        this.ds.addBankAccount(asset as IBankAccount);
        break;
      case 'nq_account_holdings':
        this.ds.addNQAccount(asset as INQAccount);
        break;
      case 'retirement_account_holdings':
        this.ds.addRetirementAccount(asset as IRetirementAccount);
        break;
      case 'life_insurance_holdings':
        this.ds.addLifeInsurance(asset as ILifeInsurance);
        break;
      case 'business_interest_holdings':
        this.ds.addBusinessInterest(asset as IBusinessInterest);
        break;
      case 'digital_asset_holdings':
        this.ds.addDigitalAsset(asset as IDigitalAsset);
        break;
      case 'other_asset_holdings':
        this.ds.addOtherAsset(asset as IOtherAsset);
        break;
    }

    this.closeAddModal();
  }

  saveEditAsset() {
    if (!this.currentAssetType || this.editingIndex < 0) return;

    const asset = this.getCurrentEditingAsset();
    if (!asset) return;

    switch (this.currentAssetType) {
      case 'real_estate_holdings':
        this.ds.updateRealEstate(asset);
        break;
      case 'bank_account_holdings':
        this.ds.updateBankAccount(asset);
        break;
      case 'nq_account_holdings':
        this.ds.updateNQAccount(asset);
        break;
      case 'retirement_account_holdings':
        this.ds.updateRetirementAccount(asset);
        break;
      case 'life_insurance_holdings':
        this.ds.updateLifeInsurance(asset);
        break;
      case 'business_interest_holdings':
        this.ds.updateBusinessInterest(asset);
        break;
      case 'digital_asset_holdings':
        this.ds.updateDigitalAsset(asset);
        break;
      case 'other_asset_holdings':
        this.ds.updateOtherAsset(asset);
        break;
    }

    this.closeEditModal();
  }

  deleteAsset(assetType: AssetType, index: number, ownership?: 'Client' | 'Spouse' |null) {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    let actualIndex = index;
    if (ownership !== undefined) {
      const assets = this.getAssetsByOwnership(assetType, ownership);
      const asset = assets[index];
      const allAssets = this.getAllAssets(assetType);
      actualIndex = allAssets.indexOf(asset);
    }

    switch (assetType) {
      case 'real_estate_holdings':
        this.ds.removeRealEstate(actualIndex);
        break;
      case 'bank_account_holdings':
        this.ds.removeBankAccount(actualIndex);
        break;
      case 'nq_account_holdings':
        this.ds.removeNQAccount(actualIndex);
        break;
      case 'retirement_account_holdings':
        this.ds.removeRetirementAccount(actualIndex);
        break;
      case 'life_insurance_holdings':
        this.ds.removeLifeInsurance(actualIndex);
        break;
      case 'business_interest_holdings':
        this.ds.removeBusinessInterest(actualIndex);
        break;
      case 'digital_asset_holdings':
        this.ds.removeDigitalAsset(actualIndex);
        break;
      case 'other_asset_holdings':
        this.ds.removeOtherAsset(actualIndex);
        break;
    }
  }

  private getCurrentEditingAsset(): any {
    switch (this.currentAssetType) {
      case 'real_estate_holdings': return this.editingRealEstate;
      case 'bank_account_holdings': return this.editingBankAccount;
      case 'nq_account_holdings': return this.editingNQAccount;
      case 'retirement_account_holdings': return this.editingRetirementAccount;
      case 'life_insurance_holdings': return this.editingLifeInsurance;
      case 'business_interest_holdings': return this.editingBusinessInterest;
      case 'digital_asset_holdings': return this.editingDigitalAsset;
      case 'other_asset_holdings': return this.editingOtherAsset;
      default: return null;
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.currentAssetType = null;
    this.clearEditingAssets();
  }



  getAssetDisplayName(assetType: string, asset: any): string {
    switch (assetType) {
      case 'real_estate_holdings':
        return `${asset.address_line1}, ${asset.city}`;
      case 'nq_account_holdings':
        return `${asset.institution_name} - ${asset.account_type}`;
      case 'bank_account_holdings':
        return `${asset.institution_name} - ${asset.account_type}`;
      case 'retirement_account_holdings':
        return `${asset.institution_name} - ${asset.account_type}`;
      case 'life_insurance_holdings':
        return `${asset.insurance_company} - ${asset.policy_type}`;
      case 'business_interest_holdings':
        return asset.business_name;
      case 'digital_asset_holdings':
        return asset.asset_name;
      case 'other_asset_holdings':
        return asset.description;
      default:
        return 'Unknown Asset';
    }
  }

  getAssetValue(assetType: string, asset: any): number {
    switch (assetType) {
      case 'real_estate_holdings':
        return +asset.approximate_value || 0;
      case 'bank_account_holdings':
        return asset.approximate_value || 0;
      case 'nq_account_holdings':
        return asset.approximate_value || 0;
      case 'retirement_account_holdings':
        return asset.approximate_value || 0;
      case 'life_insurance_holdings':
        return asset.approximate_value || 0;
      case 'business_interest_holdings':
        return asset.approximate_value || 0;
      case 'digital_asset_holdings':
        return asset.approximate_value || 0;
      case 'other_asset_holdings':
        return asset.approximate_value || 0;
      default:
        return 0;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.currentAssetType = null;
    this.editingIndex = -1;
    this.clearEditingAssets();
  }

  clearEditingAssets() {
    this.editingRealEstate = null;
    this.editingBankAccount = null;
    this.editingNQAccount = null;
    this.editingRetirementAccount = null;
    this.editingLifeInsurance = null;
    this.editingBusinessInterest = null;
    this.editingDigitalAsset = null;
    this.editingOtherAsset = null;
  }

  onBeneficiarySaved(result: any) {
  // Update the asset with beneficiary data
  const editingAsset = this.getCurrentEditingAsset();
  if (editingAsset) {
    editingAsset.primary_beneficiaries = result.primary_beneficiaries;
    editingAsset.contingent_beneficiaries = result.contingent_beneficiaries;
    editingAsset.beneficiary_scenario = result.scenario;
    this.saveEditAsset();
  }
}

closeBeneficiaryDesignation() {
  // Handle cancel - maybe just collapse the section
}
}
