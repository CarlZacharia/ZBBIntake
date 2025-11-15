export type CaseType = 'Guardianship' | 'Medicaid' | 'Both';

export interface ReferralContact {
  name: string;
  telephone: string;
  address: string;
  email: string;
}

export type GuardianType = 'person' | 'property' | 'plenary' | null;
export type YesNo = 'yes' | 'no' | null;
export type RepPayeeStatus = 'yes' | 'no' | 'applied' | null;
export type AssetAwareness = 'yes' | 'no' | 'unsure' | null;

export interface GuardianshipFormData {
  estatePlan?: string[];
  guardianType?: GuardianType;
  interestedFamily?: YesNo;
  interestedPersons?: string;
  repPayeeStatus?: RepPayeeStatus;
  awareOfAssets?: AssetAwareness;
  assetNotes?: string;
  notes?: string;
  familyContacts?: ReferralContact[];
}

export type ApplicationType = 'new' | 'renewal' | null;
export type MedicaidStatus = 'notFiled' | 'filed' | 'pending' | 'denied' | 'unsure' | null;

export interface MedicaidFormData {
  applicationType?: ApplicationType;
  filedBy?: string;
  caseNumber?: string;
  applicationNumber?: string;
  dateOfApplication?: string;
  dateNeeded?: string;
  privatePayEstimate?: string;
  status?: MedicaidStatus;
  lastNoca?: string;
  nocaContents?: string;
  notes?: string;
}

export interface ReferralPrefillData {
  facilityName?: string;
  caseType: CaseType | null;
  fullLegalName: string;
  dateOfBirth?: string;
  age?: string | number;
  ssn?: string;
  sex?: string;
  homeAddress?: string;
  currentAddress?: string;
  maritalStatus?: string;
  physicalCondition?: string;
  mentalCondition?: string;
  existingEstatePlan?: string;
  reasonForAssistance?: string;
  deemedIncapacitated?: boolean;
  incapacityDate?: string;
  monthlyIncome?: string;
  medicalInsurance?: string[];
  issues?: string;
  comments?: string;
  contacts?: ReferralContact[];
  guardianship?: GuardianshipFormData | null;
  medicaid?: MedicaidFormData | null;
}

