import { Injectable } from '@angular/core';
import {
  Asset,
  AssetCategory,
  OwnedBy,
  RealEstateMode,
  OwnershipForm,
  BeneficiaryTarget,
  NormalizedAssets,
} from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  constructor() {}

  /**
   * Main entry point: takes raw assets from data service and returns normalized, grouped assets.
   */
  normalizeAssets(input: {
    realEstate: any[];
    bank: any[];
    nq: any[];
    retirement: any[];
    lifeInsurance: any[];
    business: any[];
    digital: any[];
    other: any[];
  }): NormalizedAssets {
    const realEstate = input.realEstate.map((r) => this.mapRealEstate(r));
    const bank = input.bank.map((r) => this.mapBank(r));
    const nq = input.nq.map((r) => this.mapNQ(r));
    const retirement = input.retirement.map((r) => this.mapRetirement(r));
    const lifeInsurance = input.lifeInsurance.map((r) =>
      this.mapLifeInsurance(r),
    );
    const business = input.business.map((r) => this.mapBusiness(r));
    const digital = input.digital.map((r) => this.mapDigital(r));
    const other = input.other.map((r) => this.mapOther(r));

    const all: Asset[] = [
      ...realEstate,
      ...bank,
      ...nq,
      ...retirement,
      ...lifeInsurance,
      ...business,
      ...digital,
      ...other,
    ];

    return {
      realEstate,
      bank,
      nq,
      retirement,
      lifeInsurance,
      business,
      digital,
      other,
      all,
    };
  }

  // ===== Category-specific mapping helpers =====

  private mapRealEstate(r: any): Asset {
    // Example assumptions about raw structure:
    // r = { id, name, ownedBy, deedType, remainderTo, entityType? }

    let ownedBy = OwnedBy.ClientAndSpouse;
    if (r.ownedBy === 'Client') ownedBy = OwnedBy.Client;
    if (r.ownedBy === 'Spouse') ownedBy = OwnedBy.Spouse;
    if (r.ownedBy === 'Trust') ownedBy = OwnedBy.Trust;
    if (r.ownedBy === 'LLC') ownedBy = OwnedBy.LLC;
    if (r.ownedBy === 'Client & Spouse') ownedBy = OwnedBy.ClientAndSpouse;
    if (r.ownedBy === 'Client & Other') ownedBy = OwnedBy.ClientAndOther;
    if (r.ownedBy === 'Client, Spouse & Other')
      ownedBy = OwnedBy.ClientSpouseAndOther;

    // Map backend ownership_form to allowed frontend values
    const ownershipFormRaw = (r.ownership_form || '').trim();
    let ownershipForm: OwnershipForm;
    switch (ownershipFormRaw) {
      case 'TBE':
        ownershipForm = OwnershipForm.TBE;
        break;
      case 'JTWROS':
        ownershipForm = OwnershipForm.JTWROS;
        break;
      case 'TIC':
        ownershipForm = OwnershipForm.TIC;
        break;
      case 'Trust':
        ownershipForm = OwnershipForm.TRUST;
        break;
      case 'LLC':
        ownershipForm = OwnershipForm.LLC;
        break;
      default:
        // If not set, but owned by both client and spouse, default to TBE
        if (ownedBy === OwnedBy.ClientAndSpouse)
          ownershipForm = OwnershipForm.TBE;
        else ownershipForm = OwnershipForm.Sole;
        break;
    }

    let realEstateMode: RealEstateMode | undefined = RealEstateMode.FeeSimple;
    if (
      r.realEstateMode &&
      Object.values(RealEstateMode).includes(r.realEstateMode)
    ) {
      realEstateMode = r.realEstateMode;
    }
    if (ownedBy === OwnedBy.LLC || ownedBy === OwnedBy.Trust) {
      realEstateMode = RealEstateMode.EntityOwned;
    }

    let beneficiaryTarget: BeneficiaryTarget | undefined;
    if (r.remainderTo === 'Spouse')
      beneficiaryTarget = BeneficiaryTarget.Spouse;
    if (r.remainderTo === 'Client')
      beneficiaryTarget = BeneficiaryTarget.Client;
    if (r.remainderTo === 'Children')
      beneficiaryTarget = BeneficiaryTarget.Child;
    if (r.remainderTo === 'Family')
      beneficiaryTarget = BeneficiaryTarget.Family;
    if (r.remainderTo === 'Charity')
      beneficiaryTarget = BeneficiaryTarget.Charity;

    // Compute name from property_type, address_line1, city, state
    const computedName =
      `${r.property_type || ''}, ${r.address_line1 || ''}, ${r.city || ''}, ${r.state || ''}`
        .replace(/(, )+/g, ', ')
        .replace(/^, |, $/g, '')
        .trim();
    return {
      id: r.real_estate_id,
      idname: 'real_estate_id',
      name: computedName,
      category: AssetCategory.RealEstate,
      ownedBy,
      ownershipForm,
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      realEstateMode,
      beneficiaryTarget,
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapBank(r: any): Asset {
    const ownedBy = this.mapOwnedByGeneric(r.owned_by);
    let ownershipForm: OwnershipForm = OwnershipForm.Sole;
    const ownershipFormRaw = (r.ownership_form || '').trim();
    switch (ownershipFormRaw) {
      case 'JTWROS':
        ownershipForm = OwnershipForm.JTWROS;
        break;
      case 'TBE':
        ownershipForm = OwnershipForm.TBE;
        break;
      case 'TIC':
        ownershipForm = OwnershipForm.TIC;
        break;
      case 'Trust':
        ownershipForm = OwnershipForm.TRUST;
        break;
      case 'LLC':
        ownershipForm = OwnershipForm.LLC;
        break;
      default:
        ownershipForm = OwnershipForm.Sole;
        break;
    }
    if (r.joint_owner_name) {
      ownershipForm = OwnershipForm.JTWROS;
    }
    // No beneficiaryTarget logic yet
    return {
      id: r.bank_account_id ?? r.id,
      idname: 'bank_account_id',
      name: `${r.institution_name} ${r.account_type}`,
      category: AssetCategory.Bank,
      ownedBy,
      ownershipForm,
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapNQ(r: any): Asset {
    const ownedBy = this.mapOwnedByGeneric(r.owned_by);
    const ownershipFormRaw = (r.ownership_form || '').trim();
    let ownershipForm: OwnershipForm;
    switch (ownershipFormRaw) {
      case 'JTWROS':
        ownershipForm = OwnershipForm.JTWROS;
        break;
      case 'TBE':
        ownershipForm = OwnershipForm.TBE;
        break;
      case 'TIC':
        ownershipForm = OwnershipForm.TIC;
        break;
      case 'Trust':
        ownershipForm = OwnershipForm.TRUST;
        break;
      case 'LLC':
        ownershipForm = OwnershipForm.LLC;
        break;
      default:
        ownershipForm = OwnershipForm.Sole;
        break;
    }
    return {
      id: r.nq_account_id ?? r.id,
      idname: 'nq_account_id',
      name: `${r.institution_name} ${r.account_type}`,
      category: AssetCategory.NQ,
      ownedBy,
      ownershipForm,
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapRetirement(r: any): Asset {
    const ownedBy = this.mapOwnedByGeneric(r.owned_by);
    const ownershipFormRaw = (r.ownership_form || '').trim();
    let ownershipForm: OwnershipForm;
    switch (ownershipFormRaw) {
      case 'JTWROS':
        ownershipForm = OwnershipForm.JTWROS;
        break;
      case 'TBE':
        ownershipForm = OwnershipForm.TBE;
        break;
      case 'TIC':
        ownershipForm = OwnershipForm.TIC;
        break;
      case 'Trust':
        ownershipForm = OwnershipForm.TRUST;
        break;
      case 'LLC':
        ownershipForm = OwnershipForm.LLC;
        break;
      default:
        ownershipForm = OwnershipForm.Sole;
        break;
    }
    return {
      id: r.retirement_account_id ?? r.id,
      idname: 'retirement_account_id',
      name: `${r.institution_name} ${r.account_type}`,
      category: AssetCategory.Retirement,
      ownedBy,
      ownershipForm,
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapLifeInsurance(r: any): Asset {
    return {
      id: r.life_insurance_id ?? r.id,
      idname: 'life_insurance_id',
      name: r.name,
      category: AssetCategory.LifeInsurance,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      ownershipForm: OwnershipForm.TRUST,
            has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapBusiness(r: any): Asset {
    return {
      id: r.business_interest_id ?? r.id,
      idname: 'business_interest_id',
      name: r.name,
      category: AssetCategory.Business,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy ?? 'LLC'),
      ownershipForm: this.mapOwnershipFormGeneric(r),
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapDigital(r: any): Asset {
    return {
      id: r.digital_asset_id ?? r.id,
      idname: 'digital_asset_id',
      name: r.name,
      category: AssetCategory.Digital,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      ownershipForm: this.mapOwnershipFormGeneric(r),
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null,
    };
  }

  private mapOther(r: any): Asset {
    return {
      id: r.other_asset_id ?? r.id,
      idname: 'other_asset_id',
      name: r.name,
      category: AssetCategory.Other,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      ownershipForm: this.mapOwnershipFormGeneric(r),
      has_bene: r.has_bene,
      primary_beneficiaries: r.primary_beneficiaries,
      contingent_beneficiaries: r.contingent_beneficiaries,
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null,
    };
  }

  // ===== Small generic mappers used across categories =====

  private mapOwnedByGeneric(raw: string | undefined): OwnedBy {
    switch (raw) {
      case 'Client':
        return OwnedBy.Client;
      case 'Spouse':
        return OwnedBy.Spouse;
      case 'Client and spouse':
        return OwnedBy.ClientAndSpouse;
      case 'Client and other':
        return OwnedBy.ClientAndOther;
      case 'Client spouse and other':
        return OwnedBy.ClientSpouseAndOther;
      case 'Trust':
        return OwnedBy.Trust;
      case 'LLC':
        return OwnedBy.LLC;
      default:
        return OwnedBy.Client;
    }
  }

  private mapBeneficiaryTargetGeneric(
    raw: string | undefined,
  ): BeneficiaryTarget | undefined {
    switch (raw) {
      case 'Spouse':
        return BeneficiaryTarget.Spouse;
      case 'Client':
        return BeneficiaryTarget.Client;
      case 'Children':
        return BeneficiaryTarget.Child;
      case 'Family':
        return BeneficiaryTarget.Family;
      case 'Charity':
        return BeneficiaryTarget.Charity;
      default:
        return undefined;
    }
  }

  private mapOwnershipFormGeneric(r: any): OwnershipForm {
    const raw = (r.ownership_form || '').trim();
    switch (raw) {
      case 'Sole':
        return OwnershipForm.Sole;
      case 'JTWROS':
        return OwnershipForm.JTWROS;
      case 'TBE':
        return OwnershipForm.TBE;
      case 'TIC':
        return OwnershipForm.TIC;
      case 'Trust':
        return OwnershipForm.TRUST;
      case 'LLC':
        return OwnershipForm.LLC;
      default:
        return OwnershipForm.Sole;
    }
  }
}
