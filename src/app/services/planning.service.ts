// planning.service.ts
import { Injectable } from '@angular/core';
import {
  Asset,
  AssetCategory,
  OwnedBy,
  OwnershipForm,
  RealEstateMode,
  DispoType,
  BeneficiaryTarget,
  NormalizedAssets
} from '../models/asset.model';

@Injectable({
  providedIn: 'root'
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

    const realEstate = input.realEstate.map(r => this.mapRealEstate(r));
    const bank = input.bank.map(r => this.mapBank(r));
    const nq = input.nq.map(r => this.mapNQ(r));
    const retirement = input.retirement.map(r => this.mapRetirement(r));
    const lifeInsurance = input.lifeInsurance.map(r => this.mapLifeInsurance(r));
    const business = input.business.map(r => this.mapBusiness(r));
    const digital = input.digital.map(r => this.mapDigital(r));
    const other = input.other.map(r => this.mapOther(r));

    const all: Asset[] = [
      ...realEstate,
      ...bank,
      ...nq,
      ...retirement,
      ...lifeInsurance,
      ...business,
      ...digital,
      ...other
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
      all
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
    if (r.ownedBy === 'Client, Spouse & Other') ownedBy = OwnedBy.ClientSpouseAndOther;


    // Map backend dispo_type to frontend ownership_form
    const ownershipFormRaw = (r.ownership_form || r.dispo_type || '') as string;


    let ownershipForm: OwnershipForm | undefined = undefined;
    if (ownershipFormRaw.includes('TBE')) ownershipForm = OwnershipForm.TBE;
    else if (ownershipFormRaw.includes('JTWROS')) ownershipForm = OwnershipForm.JTWROS;
    else if (ownershipFormRaw.includes('TIC')) ownershipForm = OwnershipForm.TIC;

    // If not set, but owned by both client and spouse, default to TBE
    if (!ownershipForm && ownedBy === OwnedBy.ClientAndSpouse) {
      ownershipForm = OwnershipForm.TBE;
    }
    // If user mistakenly sets JTWROS for ClientAndSpouse, correct to TBE
    if (ownershipForm === OwnershipForm.JTWROS && ownedBy === OwnedBy.ClientAndSpouse) {
      ownershipForm = OwnershipForm.TBE;
    }
    // Otherwise, default to Sole
    if (!ownershipForm) {
      ownershipForm = OwnershipForm.Sole;
    }

    let realEstateMode: RealEstateMode | undefined = RealEstateMode.FeeSimple;
    if (ownershipFormRaw.includes('Lady Bird')) realEstateMode = RealEstateMode.LadyBird;
    if (ownershipFormRaw.includes('Life Estate')) realEstateMode = RealEstateMode.LifeEstate;
    if (ownershipFormRaw.includes('Land Contract')) realEstateMode = RealEstateMode.LandContract;
    if (ownedBy === OwnedBy.LLC || ownedBy === OwnedBy.Trust) {
      realEstateMode = RealEstateMode.EntityOwned;
    }

    let dispoType = DispoType.Will;
    if (ownershipForm === OwnershipForm.TBE || ownershipForm === OwnershipForm.JTWROS) {
      dispoType = DispoType.Joint;
    }
    if (realEstateMode === RealEstateMode.LadyBird || realEstateMode === RealEstateMode.LifeEstate) {
      dispoType = DispoType.Beneficiary;
    }
    if (realEstateMode === RealEstateMode.EntityOwned) {
      dispoType = DispoType.Trust;  // treated like entity/trust for planning
    }

    let beneficiaryTarget: BeneficiaryTarget | undefined;
    if (r.remainderTo === 'Spouse') beneficiaryTarget = BeneficiaryTarget.Spouse;
    if (r.remainderTo === 'Client') beneficiaryTarget = BeneficiaryTarget.Client;
    if (r.remainderTo === 'Children') beneficiaryTarget = BeneficiaryTarget.Child;
    if (r.remainderTo === 'Family') beneficiaryTarget = BeneficiaryTarget.Family;
    if (r.remainderTo === 'Charity') beneficiaryTarget = BeneficiaryTarget.Charity;

    // Compute name from property_type, address_line1, city, state
    const computedName = `${r.property_type || ''}, ${r.address_line1 || ''}, ${r.city || ''}, ${r.state || ''}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '').trim();
    return {
      id: r.real_estate_id,
      idname: 'real_estate_id',
      name: computedName,
      category: AssetCategory.RealEstate,
      ownedBy,
      ownershipForm,
      realEstateMode,
      dispoType,
      beneficiaryTarget,
      approximate_value: r.approximate_value ?? null
    };
  }

private mapBank(r: any): Asset {
  const ownedBy = this.mapOwnedByGeneric(r.owned_by);
  let dispoType: DispoType = DispoType.Will;
  const ownershipFormRaw = r.ownership_form || r.dispo_type || '';
  if (ownershipFormRaw === 'Will') {
    dispoType = DispoType.Will;
  }
  if (r.joint_owner_name) {
    dispoType = DispoType.Joint;
  }
  // No beneficiaryTarget logic yet
  return {
    id: r.bank_account_id ?? r.id,
    idname: 'bank_account_id',
    name: `${r.institution_name} ${r.account_type}`,
    category: AssetCategory.Bank,
    ownedBy,
    dispoType,
    approximate_value: r.approximate_value ?? null
  };
}

private mapNQ(r: any): Asset {
  const ownedBy = this.mapOwnedByGeneric(r.owned_by);
  const ownershipFormRaw = r.ownership_form || r.dispo_type || '';
  const dispoType = ownershipFormRaw === 'TOD' ? DispoType.TOD : DispoType.Will;
  return {
    id: r.nq_account_id ?? r.id,
    idname: 'nq_account_id',
    name: `${r.institution_name} ${r.account_type}`,
    category: AssetCategory.NQ,
    ownedBy,
    dispoType,
    approximate_value: r.approximate_value ?? null
  };
}

private mapRetirement(r: any): Asset {
  const ownedBy = this.mapOwnedByGeneric(r.owned_by);
  const ownershipFormRaw = r.ownership_form || r.dispo_type || '';
  const dispoType = ownershipFormRaw === 'BD' ? DispoType.BD : DispoType.Beneficiary;
  return {
    id: r.retirement_account_id ?? r.id,
    idname: 'retirement_account_id',
    name: `${r.institution_name} ${r.account_type}`,
    category: AssetCategory.Retirement,
    ownedBy,
    dispoType,
    approximate_value: r.approximate_value ?? null
  };
}



  private mapLifeInsurance(r: any): Asset {
    return {
      id: r.life_insurance_id ?? r.id,
      idname: 'life_insurance_id',
      name: r.name,
      category: AssetCategory.LifeInsurance,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      dispoType: DispoType.Beneficiary,
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null
    };
  }

  private mapBusiness(r: any): Asset {
    return {
      id: r.business_interest_id ?? r.id,
      idname: 'business_interest_id',
      name: r.name,
      category: AssetCategory.Business,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy ?? 'LLC'),
      dispoType: this.mapDispoTypeGeneric(r),
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null
    };
  }

  private mapDigital(r: any): Asset {
    return {
      id: r.digital_asset_id ?? r.id,
      idname: 'digital_asset_id',
      name: r.name,
      category: AssetCategory.Digital,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      dispoType: this.mapDispoTypeGeneric(r),
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null
    };
  }

  private mapOther(r: any): Asset {
    return {
      id: r.other_asset_id ?? r.id,
      idname: 'other_asset_id',
      name: r.name,
      category: AssetCategory.Other,
      ownedBy: this.mapOwnedByGeneric(r.ownedBy),
      dispoType: this.mapDispoTypeGeneric(r),
      beneficiaryTarget: this.mapBeneficiaryTargetGeneric(r.beneficiary),
      approximate_value: r.approximate_value ?? null
    };
  }

  // ===== Small generic mappers used across categories =====

  private mapOwnedByGeneric(raw: string | undefined): OwnedBy {
    switch (raw) {
      case 'Client': return OwnedBy.Client;
      case 'Spouse': return OwnedBy.Spouse;
      case 'Client and spouse': return OwnedBy.ClientAndSpouse;
      case 'Client and other': return OwnedBy.ClientAndOther;
      case 'Client spouse and other': return OwnedBy.ClientSpouseAndOther;
      case 'Trust': return OwnedBy.Trust;
      case 'LLC': return OwnedBy.LLC;
      default: return OwnedBy.Client;
    }
  }

  private mapBeneficiaryTargetGeneric(raw: string | undefined): BeneficiaryTarget | undefined {
    switch (raw) {
      case 'Spouse': return BeneficiaryTarget.Spouse;
      case 'Client': return BeneficiaryTarget.Client;
      case 'Children': return BeneficiaryTarget.Child;
      case 'Family': return BeneficiaryTarget.Family;
      case 'Charity': return BeneficiaryTarget.Charity;
      default: return undefined;
    }
  }

  private mapDispoTypeGeneric(r: any): DispoType {
    // crude example; you will align with your true raw fields
    if (r.joint === true || (r.owners || '').includes('Joint')) {
      return DispoType.Joint;
    }
    if (r.beneficiary) {
      return DispoType.Beneficiary;
    }
    if (r.inTrust === true) {
      return DispoType.Trust;
    }
    return DispoType.Will;
  }
}
