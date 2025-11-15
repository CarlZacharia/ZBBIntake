import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReferralsharedComponent } from './referralshared/referralshared.component';
import {
  CaseType,
  ReferralPrefillData,
  GuardianshipFormData,
  MedicaidFormData,
  ReferralContact
} from './referralshared/referral-shared.types';

interface ReferralRecord {
  id: string;
  resident: string;
  type: 'Guardianship' | 'Medicaid' | 'Both';
  submitted: string;
  status: string;
  guardianshipProgress?: number;
  medicaidProgress?: number;
  shared: {
    dob?: string;
    age?: string | number;
    sex?: string;
    maritalStatus?: string;
    homeAddress?: string;
    currentAddress?: string;
    monthlyIncome?: string;
    reason?: string;
    medicalInsurance?: string[];
    issues?: string;
    comments?: string;
  };
  contacts: Array<{
    name: string;
    phone: string;
    email: string;
    address: string;
  }>;
  guardianship: null | {
    estatePlan: string[];
    guardianType: string | null;
    interestedFamily: boolean | null;
    interestedPersons: string | null;
    repPayeeStatus: string | null;
    awareOfAssets: string | null;
    assetNotes: string | null;
    notes: string | null;
  };
  medicaid: null | {
    applicationType: string | null;
    filedBy: string | null;
    caseNumber: string | null;
    applicationNumber: string | null;
    dateOfApplication: string | null;
    dateNeeded: string | null;
    privatePayEstimate: string | null;
    status: string | null;
    lastNoca: string | null;
    nocaContents: string | null;
    notes: string | null;
  };
}

@Component({
  selector: 'app-facilityhome',
  standalone: true,
  imports: [CommonModule, RouterLink, ReferralsharedComponent],
  templateUrl: './facilityhome.component.html',
  styleUrl: './facilityhome.component.css'
})
export class FacilityhomeComponent {
  readonly facilityDetails = signal({
    name: 'Balanced Healthcare',
    address: '4250 66th St N, St Petersburg, FL 33709 #110',
    contact: 'Lisa Haney',
    contactEmail: 'LHaney@bhochg.com',
    contactPhone: '(727) 546-2405'
  });

  readonly referrals = signal<ReferralRecord[]>([
    {
      id: 'ref-24015',
      resident: 'Anthony Morales',
      type: 'Guardianship',
      submitted: 'Jan 12, 2025',
      status: 'In Progress',
      guardianshipProgress: 65,
      shared: {
        dob: '1949-09-03',
        age: 75,
        sex: 'Male',
        maritalStatus: 'Widowed',
        homeAddress: '214 Garden View Ln, Tampa, FL 33602',
        currentAddress: 'Balanced Healthcare',
        monthlyIncome: '$1,200',
        reason: 'Progressive dementia impacting financial safety',
        medicalInsurance: ['Medicare Part B', '', ''],
        issues: 'Medication adherence concerns',
        comments: 'Prefers Monday appointments'
      },
      contacts: [
        {
          name: 'Maria Morales (Sister)',
          phone: '(813) 555-1024',
          email: 'maria.morales@example.com',
          address: '102 Lake Bluff Dr, Tampa, FL 33604'
        }
      ],
      guardianship: {
        estatePlan: ['Power of Attorney', 'Living Will'],
        guardianType: 'person',
        interestedFamily: true,
        interestedPersons: 'Maria Morales (Sister)',
        repPayeeStatus: 'yes',
        awareOfAssets: 'yes',
        assetNotes: 'SunTrust checking ~ $15k, SSA benefit',
        notes: 'Family prefers onsite meeting week of Jan 20.'
      },
      medicaid: null
    },
    {
      id: 'ref-23988',
      resident: 'Helen Robertson',
      type: 'Medicaid',
      submitted: 'Dec 3, 2024',
      status: 'Approved',
      medicaidProgress: 100,
      shared: {
        dob: '1938-02-14',
        age: 87,
        sex: 'Female',
        maritalStatus: 'Single',
        homeAddress: '783 Oak Forest Dr, Brandon, FL 33511',
        currentAddress: 'Memory Care 2B',
        monthlyIncome: '$3,100',
        reason: 'Medicaid conversion to long-term waiver',
        medicalInsurance: ['Medicare Advantage', 'AARP Supplement', ''],
        issues: 'Requires memory-care notes included with filings'
      },
      contacts: [
        {
          name: 'Thomas Robertson (Son)',
          phone: '(941) 555-8410',
          email: 'thomas.robertson@example.com',
          address: '498 Palm Cove Ave, Sarasota, FL 34236'
        }
      ],
      guardianship: null,
      medicaid: {
        applicationType: 'renewal',
        filedBy: 'Facility Medicaid Dept',
        caseNumber: 'MC-445882',
        applicationNumber: 'APP-9887712',
        dateOfApplication: '2024-11-20',
        dateNeeded: '2024-12-15',
        privatePayEstimate: '$7,800',
        status: 'filed',
        lastNoca: '2024-12-28',
        nocaContents: 'Approved for waiver services effective 1/1/2025',
        notes: 'Monitor annual redetermination in November.'
      }
    },
    {
      id: 'ref-23912',
      resident: 'Michael & Patricia Hart',
      type: 'Both',
      submitted: 'Nov 18, 2024',
      status: 'Awaiting Docs',
      guardianshipProgress: 45,
      medicaidProgress: 55,
      shared: {
        dob: '1952-06-10 & 1954-01-19',
        age: '72 & 70',
        sex: 'Male / Female',
        maritalStatus: 'Married',
        homeAddress: '1210 Sea Breeze Way, Clearwater, FL 33755',
        currentAddress: 'Balanced Healthcare',
        monthlyIncome: '$6,950 combined',
        reason: 'Dual planning: plenary guardianship for Michael, Medicaid for Patricia',
        issues: 'Need combined asset inventory',
        comments: 'Family coordinating capacity evaluations'
      },
      contacts: [
        {
          name: 'Samantha Hart (Daughter)',
          phone: '(727) 555-9902',
          email: 'samantha.hart@example.com',
          address: '77 Palmetto Ave, Dunedin, FL 34698'
        },
        {
          name: 'Dr. Steven Lutz',
          phone: '(813) 555-7710',
          email: 'slutz@baymemoryclinic.com',
          address: 'Bay Memory Clinic, 201 Harbor Dr, Tampa, FL 33606'
        }
      ],
      guardianship: {
        estatePlan: ['Power of Attorney', 'Health Care Surrogate', 'Trust'],
        guardianType: 'plenary',
        interestedFamily: true,
        interestedPersons: 'Samantha Hart and Robert Hart (children)',
        repPayeeStatus: 'applied',
        awareOfAssets: 'unsure',
        assetNotes: 'Awaiting brokerage statements; estimated 401k ~$220k',
        notes: 'Physician capacity letter scheduled 12/05.'
      },
      medicaid: {
        applicationType: 'new',
        filedBy: 'Samantha Hart',
        caseNumber: 'MC-441201',
        applicationNumber: 'APP-9773411',
        dateOfApplication: '2024-11-10',
        dateNeeded: '2025-01-01',
        privatePayEstimate: '$12,400',
        status: 'pending',
        lastNoca: null,
        nocaContents: null,
        notes: 'Spend-down plan in progress; awaiting trust review.'
      }
    }
  ]);

  readonly selectedReferralId = signal(this.referrals()[0]?.id ?? null);
  readonly selectedReferral = computed(() =>
    this.referrals().find(ref => ref.id === this.selectedReferralId()) ?? null
  );
  readonly searchTerm = signal('');
  readonly filteredReferrals = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const records = this.referrals();
    if (!term) {
      return records;
    }
    return records.filter(referral =>
      referral.resident.toLowerCase().includes(term)
    );
  });
  readonly selectedReferralPrefill = computed<ReferralPrefillData | null>(() => {
    const referral = this.selectedReferral();
    if (!referral) {
      return null;
    }
    return this.mapReferralToPrefill(referral);
  });

  readonly loggedInContact = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return {
        name: '—',
        email: '—',
        phone: '—'
      };
    }
    return {
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone || 'Not provided'
    };
  });

  constructor(public authService: AuthService) { }

  selectReferral(id: string): void {
    this.selectedReferralId.set(id);
  }

  updateSearch(term: string): void {
    this.searchTerm.set(term);
  }

  private mapReferralToPrefill(referral: ReferralRecord): ReferralPrefillData {
    const facility = this.facilityDetails();
    const medicalInsurance = referral.shared.medicalInsurance ?? ['', '', ''];

    const contacts: ReferralContact[] = referral.contacts?.length
      ? referral.contacts.map(contact => ({
        name: contact.name || '',
        telephone: contact.phone || '',
        address: contact.address || '',
        email: contact.email || ''
      }))
      : [{ name: '', telephone: '', address: '', email: '' }];

    let guardianship: GuardianshipFormData | null = null;
    if (referral.guardianship) {
      guardianship = {
        estatePlan: referral.guardianship.estatePlan ?? [],
        guardianType: referral.guardianship.guardianType as GuardianshipFormData['guardianType'],
        interestedFamily: referral.guardianship.interestedFamily ? 'yes' : 'no',
        interestedPersons: referral.guardianship.interestedPersons ?? '',
        repPayeeStatus: referral.guardianship.repPayeeStatus as GuardianshipFormData['repPayeeStatus'],
        awareOfAssets: referral.guardianship.awareOfAssets as GuardianshipFormData['awareOfAssets'],
        assetNotes: referral.guardianship.assetNotes ?? '',
        notes: referral.guardianship.notes ?? '',
        familyContacts: contacts
      };
    }

    let medicaid: MedicaidFormData | null = null;
    if (referral.medicaid) {
      medicaid = {
        applicationType: referral.medicaid.applicationType as MedicaidFormData['applicationType'],
        filedBy: referral.medicaid.filedBy ?? '',
        caseNumber: referral.medicaid.caseNumber ?? '',
        applicationNumber: referral.medicaid.applicationNumber ?? '',
        dateOfApplication: referral.medicaid.dateOfApplication ?? '',
        dateNeeded: referral.medicaid.dateNeeded ?? '',
        privatePayEstimate: referral.medicaid.privatePayEstimate ?? '',
        status: referral.medicaid.status as MedicaidFormData['status'],
        lastNoca: referral.medicaid.lastNoca ?? '',
        nocaContents: referral.medicaid.nocaContents ?? '',
        notes: referral.medicaid.notes ?? ''
      };
    }

    return {
      facilityName: facility.name,
      caseType: referral.type as CaseType,
      fullLegalName: referral.resident,
      dateOfBirth: referral.shared.dob ?? '',
      age: referral.shared.age ?? '',
      sex: referral.shared.sex ?? '',
      homeAddress: referral.shared.homeAddress ?? '',
      currentAddress: referral.shared.currentAddress ?? '',
      maritalStatus: referral.shared.maritalStatus ?? '',
      monthlyIncome: referral.shared.monthlyIncome ?? '',
      reasonForAssistance: referral.shared.reason ?? '',
      medicalInsurance,
      issues: referral.shared.issues ?? '',
      comments: referral.shared.comments ?? '',
      deemedIncapacitated: false,
      contacts,
      guardianship,
      medicaid
    };
  }
}

