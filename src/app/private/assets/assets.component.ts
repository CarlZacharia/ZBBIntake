import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import {
  IRealEstate,
  IFinancialAccount,
  IRetirementAccount,
  ILifeInsurance,
  IBusinessInterest,
  IDigitalAsset,
  IOtherAsset,
  IBeneficiary
} from '../../models/case_data';

type AssetType = 'real_estate' | 'financial_account' | 'retirement_account' | 'life_insurance' | 'business_interest' | 'digital_asset' | 'other_asset';

@Component({
  selector: 'app-assets',
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent {

  // Modal visibility flags
  showAddModal = false;
  showEditModal = false;
  currentAssetType: AssetType | null = null;

  // Editing asset references
  editingRealEstate: IRealEstate | null = null;
  editingFinancialAccount: IFinancialAccount | null = null;
  editingRetirementAccount: IRetirementAccount | null = null;
  editingLifeInsurance: ILifeInsurance | null = null;
  editingBusinessInterest: IBusinessInterest | null = null;
  editingDigitalAsset: IDigitalAsset | null = null;
  editingOtherAsset: IOtherAsset | null = null;
  editingIndex: number = -1;

  // Reactive data access
  readonly assets = computed(() => this.ds.assets());
  readonly maritalInfo = computed(() => this.ds.maritalInfo());
  readonly isMarriedSignal = computed(() => this.maritalInfo().marital_status === 'married');

  // US States for dropdowns
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  constructor(public ds: DataService) { }

  // Backwards compatibility
  get isMarried(): boolean {
    return this.isMarriedSignal();
  }

  // --- Asset Filtering Methods ---

  getClientAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, 'client');
  }

  getSpouseAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, 'spouse');
  }

  getJointAssets(assetType: string): any[] {
    return this.getAssetsByOwnership(assetType, null);
  }

  getAllAssets(assetType: string): any[] {
    const assets = this.assets();
    switch (assetType) {
      case 'real_estate': return assets.real_estate_holdings;
      case 'financial_account': return assets.financial_account_holdings;
      case 'retirement_account': return assets.retirement_account_holdings;
      case 'life_insurance': return assets.life_insurance_holdings;
      case 'business_interest': return assets.business_interest_holdings;
      case 'digital_asset': return assets.digital_asset_holdings;
      case 'other_asset': return assets.other_asset_holdings;
      default: return [];
    }
  }

  private getAssetsByOwnership(assetType: string, ownership: 'client' | 'spouse' | null): any[] {
    const allAssets = this.getAllAssets(assetType);
    if (ownership === null) {
      // Joint assets are those without owned_by set
      return allAssets.filter((asset: any) => !asset.owned_by);
    }
    return allAssets.filter((asset: any) => asset.owned_by === ownership);
  }

  // --- Total Calculation Methods ---

  getTotalValue(assetType: string, ownership?: 'client' | 'spouse' | null): number {
    const assets = ownership !== undefined
      ? this.getAssetsByOwnership(assetType, ownership)
      : this.getAllAssets(assetType);

    return assets.reduce((total, asset) => {
      let value = 0;
      switch (assetType) {
        case 'real_estate':
          value = asset.ownership_value || asset.net_value || asset.estimated_value || 0;
          break;
        case 'financial_account':
          value = asset.approximate_balance || 0;
          break;
        case 'retirement_account':
          value = asset.approximate_value || 0;
          break;
        case 'life_insurance':
          value = asset.death_benefit || 0;
          break;
        case 'business_interest':
          value = asset.estimated_value || 0;
          break;
        case 'digital_asset':
          value = asset.estimated_value || 0;
          break;
        case 'other_asset':
          value = asset.estimated_value || 0;
          break;
      }
      return total + value;
    }, 0);
  }

  getGrandTotal(ownership?: 'client' | 'spouse' | null): number {
    const types: AssetType[] = ['real_estate', 'financial_account', 'retirement_account', 'life_insurance', 'business_interest', 'digital_asset', 'other_asset'];
    return types.reduce((total, type) => total + this.getTotalValue(type, ownership), 0);
  }

  // --- Modal Methods ---

  openAddModal(assetType: AssetType) {
    this.currentAssetType = assetType;
    this.initializeEditingAsset(assetType);
    this.showAddModal = true;
  }

  openEditModal(assetType: AssetType, index: number, ownership?: 'client' | 'spouse' | null) {
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
      case 'real_estate':
        this.editingRealEstate = { ...this.ds.realEstate };
        break;
      case 'financial_account':
        this.editingFinancialAccount = { ...this.ds.financialAccount };
        break;
      case 'retirement_account':
        this.editingRetirementAccount = { ...this.ds.retirementAccount };
        break;
      case 'life_insurance':
        this.editingLifeInsurance = { ...this.ds.lifeInsurance };
        break;
      case 'business_interest':
        this.editingBusinessInterest = { ...this.ds.businessInterest };
        break;
      case 'digital_asset':
        this.editingDigitalAsset = { ...this.ds.digitalAsset };
        break;
      case 'other_asset':
        this.editingOtherAsset = { ...this.ds.otherAsset };
        break;
    }
  }

  private setEditingAsset(assetType: AssetType, asset: any) {
    switch (assetType) {
      case 'real_estate':
        this.editingRealEstate = asset;
        break;
      case 'financial_account':
        this.editingFinancialAccount = asset;
        break;
      case 'retirement_account':
        this.editingRetirementAccount = asset;
        break;
      case 'life_insurance':
        this.editingLifeInsurance = asset;
        break;
      case 'business_interest':
        this.editingBusinessInterest = asset;
        break;
      case 'digital_asset':
        this.editingDigitalAsset = asset;
        break;
      case 'other_asset':
        this.editingOtherAsset = asset;
        break;
    }
  }

  saveNewAsset() {
    if (!this.currentAssetType) return;

    const asset = this.getCurrentEditingAsset();
    if (!asset) return;

    switch (this.currentAssetType) {
      case 'real_estate':
        this.ds.addRealEstate(asset as IRealEstate);
        break;
      case 'financial_account':
        this.ds.addFinancialAccount(asset as IFinancialAccount);
        break;
      case 'retirement_account':
        this.ds.addRetirementAccount(asset as IRetirementAccount);
        break;
      case 'life_insurance':
        this.ds.addLifeInsurance(asset as ILifeInsurance);
        break;
      case 'business_interest':
        this.ds.addBusinessInterest(asset as IBusinessInterest);
        break;
      case 'digital_asset':
        this.ds.addDigitalAsset(asset as IDigitalAsset);
        break;
      case 'other_asset':
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
      case 'real_estate':
        this.ds.updateRealEstate(this.editingIndex, asset as IRealEstate);
        break;
      case 'financial_account':
        this.ds.updateFinancialAccount(this.editingIndex, asset as IFinancialAccount);
        break;
      case 'retirement_account':
        this.ds.updateRetirementAccount(this.editingIndex, asset as IRetirementAccount);
        break;
      case 'life_insurance':
        this.ds.updateLifeInsurance(this.editingIndex, asset as ILifeInsurance);
        break;
      case 'business_interest':
        this.ds.updateBusinessInterest(this.editingIndex, asset as IBusinessInterest);
        break;
      case 'digital_asset':
        this.ds.updateDigitalAsset(this.editingIndex, asset as IDigitalAsset);
        break;
      case 'other_asset':
        this.ds.updateOtherAsset(this.editingIndex, asset as IOtherAsset);
        break;
    }

    this.closeEditModal();
  }

  deleteAsset(assetType: AssetType, index: number, ownership?: 'client' | 'spouse' | null) {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    let actualIndex = index;
    if (ownership !== undefined) {
      const assets = this.getAssetsByOwnership(assetType, ownership);
      const asset = assets[index];
      const allAssets = this.getAllAssets(assetType);
      actualIndex = allAssets.indexOf(asset);
    }

    switch (assetType) {
      case 'real_estate':
        this.ds.removeRealEstate(actualIndex);
        break;
      case 'financial_account':
        this.ds.removeFinancialAccount(actualIndex);
        break;
      case 'retirement_account':
        this.ds.removeRetirementAccount(actualIndex);
        break;
      case 'life_insurance':
        this.ds.removeLifeInsurance(actualIndex);
        break;
      case 'business_interest':
        this.ds.removeBusinessInterest(actualIndex);
        break;
      case 'digital_asset':
        this.ds.removeDigitalAsset(actualIndex);
        break;
      case 'other_asset':
        this.ds.removeOtherAsset(actualIndex);
        break;
    }
  }

  private getCurrentEditingAsset(): any {
    switch (this.currentAssetType) {
      case 'real_estate': return this.editingRealEstate;
      case 'financial_account': return this.editingFinancialAccount;
      case 'retirement_account': return this.editingRetirementAccount;
      case 'life_insurance': return this.editingLifeInsurance;
      case 'business_interest': return this.editingBusinessInterest;
      case 'digital_asset': return this.editingDigitalAsset;
      case 'other_asset': return this.editingOtherAsset;
      default: return null;
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.currentAssetType = null;
    this.clearEditingAssets();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.currentAssetType = null;
    this.editingIndex = -1;
    this.clearEditingAssets();
  }

  private clearEditingAssets() {
    this.editingRealEstate = null;
    this.editingFinancialAccount = null;
    this.editingRetirementAccount = null;
    this.editingLifeInsurance = null;
    this.editingBusinessInterest = null;
    this.editingDigitalAsset = null;
    this.editingOtherAsset = null;
  }

  // --- Formatting Methods ---

  formatCurrency(value: number | null): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getAssetDisplayName(assetType: string, asset: any): string {
    switch (assetType) {
      case 'real_estate':
        return `${asset.address_line1}, ${asset.city}`;
      case 'financial_account':
        return `${asset.institution_name} - ${asset.account_type}`;
      case 'retirement_account':
        return `${asset.institution_name} - ${asset.account_type}`;
      case 'life_insurance':
        return `${asset.insurance_company} - ${asset.policy_type}`;
      case 'business_interest':
        return asset.business_name;
      case 'digital_asset':
        return asset.asset_name;
      case 'other_asset':
        return asset.description;
      default:
        return 'Unknown Asset';
    }
  }

  getAssetValue(assetType: string, asset: any): number {
    switch (assetType) {
      case 'real_estate':
        return asset.ownership_value || asset.net_value || asset.estimated_value || 0;
      case 'financial_account':
        return asset.approximate_balance || 0;
      case 'retirement_account':
        return asset.approximate_value || 0;
      case 'life_insurance':
        return asset.death_benefit || 0;
      case 'business_interest':
        return asset.estimated_value || 0;
      case 'digital_asset':
        return asset.estimated_value || 0;
      case 'other_asset':
        return asset.estimated_value || 0;
      default:
        return 0;
    }
  }
}
