import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GuardianshipComponent } from './guardianship/guardianship.component';
import { MedicaidComponent } from './medicaid/medicaid.component';

const CASE_TYPES = ['Guardianship', 'Medicaid', 'Both'] as const;
type CaseType = typeof CASE_TYPES[number];

interface NextOfKinContact {
  name: string;
  telephone: string;
  address: string;
  email: string;
}

@Component({
  selector: 'app-referralshared',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GuardianshipComponent, MedicaidComponent],
  templateUrl: './referralshared.component.html',
  styleUrl: './referralshared.component.css'
})
export class ReferralsharedComponent {
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

  readonly nextOfKinContacts = signal<NextOfKinContact[]>([
    { name: '', telephone: '', address: '', email: '' }
  ]);

  readonly caseTypes = CASE_TYPES;
  maritalStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Domestic Partnership'];
  sexOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to answer'];

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

  updateNextOfKin(index: number, field: keyof NextOfKinContact, value: string): void {
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

