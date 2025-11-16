import { CommonModule } from '@angular/common';
import { Component, Input, signal, OnChanges, SimpleChanges, ViewChild, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuardianshipComponent } from './guardianship/guardianship.component';
import { MedicaidComponent } from './medicaid/medicaid.component';
import {
  CaseType,
  ReferralPrefillData,
  ReferralContact,
  GuardianshipFormData,
  MedicaidFormData,
  SubmissionStatus
} from './referral-shared.types';
import {
  FacilityReferralService,
  ReferralSavePayload
} from '../facility-referral.service';

@Component({
  selector: 'app-referralshared',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GuardianshipComponent, MedicaidComponent],
  templateUrl: './referralshared.component.html',
  styleUrl: './referralshared.component.css'
})
export class ReferralsharedComponent implements OnChanges {
  @Input() prefillData: ReferralPrefillData | null = null;
  @Input() showHeroBar = true;
  @ViewChild(GuardianshipComponent) guardianshipSection?: GuardianshipComponent;
  @ViewChild(MedicaidComponent) medicaidSection?: MedicaidComponent;

  private readonly referralService = inject(FacilityReferralService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private currentReferralId: number | string | null = null;

  readonly referralData = signal({
    facilityName: '',
    caseType: null as CaseType | null,
    fullLegalName: '',
    dateOfBirth: '',
    age: '',
    ssn: '',
    sex: '',
    homeAddress: '',
    currentAddress: '',
    maritalStatus: '',
    physicalCondition: '',
    mentalCondition: '',
    existingEstatePlan: '',
    reasonForAssistance: '',
    deemedIncapacitated: false,
    incapacityDate: '',
    monthlyIncome: '',
    medicalInsurance: ['', '', ''],
    issues: '',
    comments: '',
    spouseName: '',
    spouseAddress: '',
    spousePhone: '',
    spouseEmail: '',
    spouseDob: '',
    spouseAge: '',
    spouseSex: '',
    spouseLivingConditions: '',
    spouseHealth: ''
  });

  readonly nextOfKinContacts = signal<ReferralContact[]>([
    { name: '', telephone: '', address: '', email: '' }
  ]);

  readonly guardianshipPrefill = signal<GuardianshipFormData | null>(null);
  readonly medicaidPrefill = signal<MedicaidFormData | null>(null);

  readonly caseTypes = ['Guardianship', 'Medicaid', 'Both'] as const;
  maritalStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Domestic Partnership'];
  sexOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to answer'];
  spouseLivingOptions = [
    'Owns Home',
    'Rents',
    'Assisted Living',
    'Nursing Home',
    'With Relative',
    'Other'
  ];
  readonly isSaving = signal(false);
  readonly lastSavedStatus = signal<SubmissionStatus>('draft');
  readonly lastSavedAt = signal<string | null>(null);
  readonly saveMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prefillData']) {
      this.applyPrefill(changes['prefillData'].currentValue as ReferralPrefillData | null);
    }
  }

  private applyPrefill(prefill: ReferralPrefillData | null): void {
    if (!prefill) {
      this.currentReferralId = null;
      this.lastSavedStatus.set('draft');
      this.lastSavedAt.set(null);
      return;
    }

    this.currentReferralId = prefill.referralId ?? null;
    this.lastSavedStatus.set(prefill.submissionStatus ?? 'draft');
    this.lastSavedAt.set(prefill.createdAt ?? null);

    this.referralData.update(current => ({
      ...current,
      facilityName: prefill.facilityName ?? '',
      caseType: prefill.caseType ?? null,
      fullLegalName: prefill.fullLegalName ?? '',
      dateOfBirth: prefill.dateOfBirth ?? '',
      age: String(prefill.age ?? ''),
      ssn: prefill.ssn ?? '',
      sex: prefill.sex ?? '',
      homeAddress: prefill.homeAddress ?? '',
      currentAddress: prefill.currentAddress ?? '',
      maritalStatus: prefill.maritalStatus ?? '',
      physicalCondition: prefill.physicalCondition ?? '',
      mentalCondition: prefill.mentalCondition ?? '',
      existingEstatePlan: prefill.existingEstatePlan ?? '',
      reasonForAssistance: prefill.reasonForAssistance ?? '',
      deemedIncapacitated: prefill.deemedIncapacitated ?? false,
      incapacityDate: prefill.incapacityDate ?? '',
      monthlyIncome: prefill.monthlyIncome ?? '',
      medicalInsurance: prefill.medicalInsurance?.length
        ? prefill.medicalInsurance
        : ['', '', ''],
      issues: prefill.issues ?? '',
      comments: prefill.comments ?? '',
      spouseName: prefill.spouse?.name ?? '',
      spouseAddress: prefill.spouse?.address ?? '',
      spousePhone: prefill.spouse?.phone ?? '',
      spouseEmail: prefill.spouse?.email ?? '',
      spouseDob: prefill.spouse?.dob ?? '',
      spouseAge: prefill.spouse?.age ? String(prefill.spouse?.age) : '',
      spouseSex: prefill.spouse?.sex ?? '',
      spouseLivingConditions: prefill.spouse?.livingConditions ?? '',
      spouseHealth: prefill.spouse?.health ?? ''
    }));

    const contacts = prefill.contacts?.length
      ? prefill.contacts
      : [{ name: '', telephone: '', address: '', email: '' }];
    this.nextOfKinContacts.set(
      contacts.map(contact => ({
        name: contact.name || '',
        telephone: contact.telephone || '',
        address: contact.address || '',
        email: contact.email || ''
      }))
    );

    this.guardianshipPrefill.set(prefill.guardianship ?? null);
    this.medicaidPrefill.set(prefill.medicaid ?? null);
  }

  saveDraft(): void {
    console.log('Current Referral ID:', this.currentReferralId);
    this.persistReferral('draft');
  }

  updateField<T extends keyof ReturnType<typeof this.referralData>>(
    field: T,
    value: ReturnType<typeof this.referralData>[T]
  ): void {
    this.referralData.update(current => ({
      ...current,
      [field]: value
    }));
  }

  updateMaritalStatus(status: string): void {
    this.updateField('maritalStatus', status);
    if (status !== 'Married') {
      this.referralData.update(current => ({
        ...current,
        spouseName: '',
        spouseAddress: '',
        spousePhone: '',
        spouseEmail: '',
        spouseDob: '',
        spouseAge: '',
        spouseSex: '',
        spouseLivingConditions: '',
        spouseHealth: ''
      }));
    }
  }

  updateMedicalInsurance(index: number, value: string): void {
    const medical = [...this.referralData().medicalInsurance];
    medical[index] = value;
    this.updateField('medicalInsurance', medical);
  }

  addNextOfKin(): void {
    this.nextOfKinContacts.update(list => [
      ...list,
      { name: '', telephone: '', address: '', email: '' }
    ]);
  }

  removeNextOfKin(index: number): void {
    if (this.nextOfKinContacts().length === 1) return;
    this.nextOfKinContacts.update(list => list.filter((_, i) => i !== index));
  }

  updateNextOfKin(index: number, field: keyof ReferralContact, value: string): void {
    this.nextOfKinContacts.update(list => {
      const copy = [...list];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  setCaseType(type: CaseType): void {
    this.updateField('caseType', type);
  }

  submitReferral(): void {
    if (!this.referralData().caseType) {
      alert('Please select a referral type before submitting your intake.');
      return;
    }

    this.persistReferral('submitted');
  }

  private persistReferral(status: SubmissionStatus): void {
    if (this.isSaving()) {
      return;
    }

    const payload = this.buildPayload();
    if (status === 'submitted' && !payload.caseType) {
      alert('Please select a referral type before submitting your intake.');
      return;
    }

    this.isSaving.set(true);
    this.referralService.saveReferral(payload, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const referralId = response.data?.referral_id ?? null;
          if (referralId) {
            this.currentReferralId = referralId;
          }
          this.lastSavedStatus.set(status);
          this.lastSavedAt.set(new Date().toISOString());
          const message = status === 'draft' ? 'Draft saved' : 'Referral submitted';
          this.saveMessage.set(message);
          setTimeout(() => this.saveMessage.set(null), 4000);
          this.isSaving.set(false);
        },
        error: () => {
          this.isSaving.set(false);
          alert('Unable to save referral at this time.');
        }
      });
  }

  private buildPayload(): ReferralSavePayload {
    const shared = this.referralData();
    const contacts = this.nextOfKinContacts().map(contact => ({
      name: contact.name,
      telephone: contact.telephone,
      address: contact.address,
      email: contact.email
    }));

    return {
      referralId: this.currentReferralId ?? undefined,
      facilityName: shared.facilityName,
      caseType: shared.caseType,
      fullLegalName: shared.fullLegalName,
      dateOfBirth: shared.dateOfBirth || undefined,
      age: shared.age || undefined,
      ssn: shared.ssn || undefined,
      sex: shared.sex || undefined,
      homeAddress: shared.homeAddress || undefined,
      currentAddress: shared.currentAddress || undefined,
      maritalStatus: shared.maritalStatus || undefined,
      physicalCondition: shared.physicalCondition || undefined,
      mentalCondition: shared.mentalCondition || undefined,
      existingEstatePlan: shared.existingEstatePlan || undefined,
      reasonForNeed: shared.reasonForAssistance || undefined,
      deemedIncapacitated: shared.deemedIncapacitated,
      incapacityDate: shared.incapacityDate || undefined,
      monthlyIncome: shared.monthlyIncome || undefined,
      medicalInsurance: shared.medicalInsurance,
      issues: shared.issues || undefined,
      comments: shared.comments || undefined,
      contacts,
      guardianship: this.includeGuardianship() ? this.guardianshipSection?.getState() ?? null : null,
      medicaid: this.includeMedicaid() ? this.medicaidSection?.getState() ?? null : null,
      spouseName: shared.spouseName || undefined,
      spouseAddress: shared.spouseAddress || undefined,
      spousePhone: shared.spousePhone || undefined,
      spouseEmail: shared.spouseEmail || undefined,
      spouseDob: shared.spouseDob || undefined,
      spouseAge: shared.spouseAge || undefined,
      spouseSex: shared.spouseSex || undefined,
      spouseLivingConditions: shared.spouseLivingConditions || undefined,
      spouseHealth: shared.spouseHealth || undefined
    };
  }

  private includeGuardianship(): boolean {
    const caseType = this.referralData().caseType;
    return caseType === 'Guardianship' || caseType === 'Both';
  }

  private includeMedicaid(): boolean {
    const caseType = this.referralData().caseType;
    return caseType === 'Medicaid' || caseType === 'Both';
  }
}

