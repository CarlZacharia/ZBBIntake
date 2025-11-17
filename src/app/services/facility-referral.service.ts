import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CaseType,
  GuardianshipFormData,
  MedicaidFormData,
  ReferralContact,
  SubmissionStatus,
  SpouseInfo
} from '../private/facilityhome/referralshared/referral-shared.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FacilityReferralDto {
  referralId: number;
  submissionStatus: SubmissionStatus;
  providerName: string | null;
  providerType: string | null;
  caseType: CaseType | null;
  fullLegalName: string;
  dateOfBirth?: string | null;
  age?: number | string | null;
  sex?: string | null;
  maritalStatus?: string | null;
  homeAddress?: string | null;
  currentAddress?: string | null;
  monthlyIncome?: string | null;
  physicalCondition?: string | null;
  mentalCondition?: string | null;
  existingEstatePlan?: string | null;
  incapacityDate?: string | null;
  deemedIncapacitated?: boolean | null;
  reasonForAssistance?: string | null;
  medicalInsurance?: string[] | null;
  issues?: string | null;
  comments?: string | null;
  createdAt?: string;
  submittedAt?: string | null;
  contacts: ReferralContact[];
  guardianship: GuardianshipFormData | null;
  medicaid: MedicaidFormData | null;
  spouse?: SpouseInfo | null;
}

export interface ReferralSavePayload {
  referralId?: number | string;
  providerName?: string;
  providerType?: string;
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
  reasonForNeed?: string;
  deemedIncapacitated?: boolean;
  incapacityDate?: string;
  monthlyIncome?: string;
  medicalInsurance?: string[];
  issues?: string;
  comments?: string;
  contacts?: ReferralContact[];
  guardianship?: GuardianshipFormData | null;
  medicaid?: MedicaidFormData | null;
  spouseName?: string;
  spouseAddress?: string;
  spousePhone?: string;
  spouseEmail?: string;
  spouseDob?: string;
  spouseAge?: string | number;
  spouseSex?: string;
  spouseLivingConditions?: string;
  spouseHealth?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacilityReferralService {
  private readonly API_URL = 'https://www.zacbrownportal.com/api/facility';

  constructor(private readonly http: HttpClient) { }

  saveReferral(payload: ReferralSavePayload, submissionStatus: SubmissionStatus): Observable<ApiResponse<{ referral_id: number }>> {
    const body = {
      ...payload,
      submissionStatus
    };
    return this.http.post<ApiResponse<{ referral_id: number }>>(
      `${this.API_URL}/save-referral.php`,
      body
    );
  }

  listReferrals(): Observable<FacilityReferralDto[]> {
    return this.http
      .get<ApiResponse<{ referrals: FacilityReferralDto[] }>>(`${this.API_URL}/list-referrals.php`)
      .pipe(
        map(response => response.data?.referrals ?? [])
      );
  }
}


