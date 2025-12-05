export enum AssetCategory {
  RealEstate = 'RealEstate',
  Bank = 'Bank',
  NQ = 'NQ',
  Retirement = 'Retirement',
  LifeInsurance = 'LifeInsurance',
  Business = 'Business',
  Digital = 'Digital',
  Other = 'Other',
}

export enum OwnedBy {
  Client = 'Client',
  Spouse = 'Spouse',
  ClientAndSpouse = 'ClientAndSpouse',
  ClientAndOther = 'ClientAndOther',
  ClientSpouseAndOther = 'ClientSpouseAndOther',
  Trust = 'Trust',
  LLC = 'LLC',
}

export enum OwnershipForm {
  Sole = 'Sole',
  JTWROS = 'JTWROS',
  TIC = 'TIC',
  TBE = 'TBE',
  TRUST = 'Trust',
  LLC = 'LLC',
}

export enum RealEstateMode {
  FeeSimple = 'FeeSimple',
  LifeEstate = 'LifeEstate',
  LadyBird = 'LadyBird',
  LandContract = 'LandContract',
  EntityOwned = 'EntityOwned',
}

export enum DispoType {
  Will = 'Will',
  Joint = 'Joint',
  Beneficiary = 'Beneficiary',
  Trust = 'Trust',
  TOD = 'TOD', // for NQ dispo_type: 'TOD'
  BD = 'BD',
}

export enum BeneficiaryTarget {
  Spouse = 'Spouse',
  Client = 'Client',
  Child = 'Child',
  Family = 'Family',
  Charity = 'Charity',
}

export interface Asset {
  id: string;
  idname: string;
  name: string;
  category: AssetCategory;
  ownedBy: OwnedBy;
  ownershipForm?: OwnershipForm;
  realEstateMode?: RealEstateMode;
  beneficiaryTarget?: BeneficiaryTarget;
  approximate_value?: number | null;
  has_bene?: 'Yes' | 'No' | null;
  primary_beneficiaries?: any[];
  secondary_beneficiaries?: any[];
}

// Optional grouping return type
export interface NormalizedAssets {
  realEstate: Asset[];
  bank: Asset[];
  nq: Asset[];
  retirement: Asset[];
  lifeInsurance: Asset[];
  business: Asset[];
  digital: Asset[];
  other: Asset[];
  all: Asset[];
}
