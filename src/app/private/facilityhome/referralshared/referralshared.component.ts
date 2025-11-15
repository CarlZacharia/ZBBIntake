import { CommonModule } from '@angular/common';
import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GuardianshipComponent } from './guardianship/guardianship.component';
import { MedicaidComponent } from './medicaid/medicaid.component';
import {
  CaseType,
  ReferralPrefillData,
  ReferralContact,
  GuardianshipFormData,
  MedicaidFormData
} from './referral-shared.types';

@Component({
  selector: 'app-referralshared',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GuardianshipComponent, MedicaidComponent],
  templateUrl: './referralshared.component.html',
  styleUrl: './referralshared.component.css'
})
export class ReferralsharedComponent implements OnChanges {
  @Input() prefillData: ReferralPrefillData | null = null;

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
    comments: ''
  });

  readonly nextOfKinContacts = signal<ReferralContact[]>([
    { name: '', telephone: '', address: '', email: '' }
  ]);

  readonly guardianshipPrefill = signal<GuardianshipFormData | null>(null);
  readonly medicaidPrefill = signal<MedicaidFormData | null>(null);

  readonly caseTypes = ['Guardianship', 'Medicaid', 'Both'] as const;
  maritalStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Domestic Partnership'];
  sexOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to answer'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prefillData']) {
      this.applyPrefill(changes['prefillData'].currentValue as ReferralPrefillData | null);
    }
  }

  private applyPrefill(prefill: ReferralPrefillData | null): void {
    if (!prefill) {
      return;
    }

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
      comments: prefill.comments ?? ''
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

  updateField<T extends keyof ReturnType<typeof this.referralData>>(
    field: T,
    value: ReturnType<typeof this.referralData>[T]
  ): void {
    this.referralData.update(current => ({
      ...current,
      [field]: value
    }));
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

    // TODO: handle submission
    console.log('Submitting referral', this.referralData());
  }
}

