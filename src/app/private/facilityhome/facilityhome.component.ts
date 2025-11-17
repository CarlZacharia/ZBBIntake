import { Component, computed, signal, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ReferralsharedComponent } from './referralshared/referralshared.component';
// import { FacilityProfileComponent } from './facilityprofile.component';
import {
  CaseType,
  ReferralPrefillData,
  GuardianshipFormData,
  MedicaidFormData,
  ReferralContact,
  SubmissionStatus,
  SpouseInfo
} from './referralshared/referral-shared.types';
import {
  FacilityReferralDto,
  FacilityReferralService
} from '../../services/facility-referral.service';

interface ReferralRecord {
  id: string;
  resident: string;
  type: CaseType | null;
  submitted: string;
  status: string;
  submissionStatus: SubmissionStatus;
  createdAt?: string;
  submittedAt?: string | null;
  providerName?: string | null;
  providerType?: string | null;
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
    physicalCondition?: string;
    mentalCondition?: string;
    existingEstatePlan?: string;
    incapacityDate?: string;
    deemedIncapacitated?: boolean;
    medicalInsurance?: string[];
    issues?: string;
    comments?: string;
  };
  contacts: ReferralContact[];
  spouse?: SpouseInfo | null;
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
export class FacilityhomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly facilityDetails = signal({
    provider_name: 'Balanced Healthcare',
    provider_type: 'Skilled Nursing Facility',
    address: '4250 66th St N, St Petersburg, FL 33709 #110',
    contact: 'Lisa Haney',
    contactEmail: 'LHaney@bhochg.com',
    contactPhone: '(727) 546-2405'
  });

  readonly draftReferrals = signal<ReferralRecord[]>([
    {
      id: 'draft-24041',
      resident: 'Eleanor Briggs',
      type: 'Medicaid',
      submitted: 'Draft saved Jan 8, 2025',
      status: 'Draft',
      submissionStatus: 'draft',
      createdAt: '2025-01-08T09:00:00Z',
      shared: {
        dob: '',
        age: '',
        sex: '',
        maritalStatus: '',
        homeAddress: '',
        currentAddress: '',
        monthlyIncome: '',
        reason: 'Pending medical invoices from facility',
        medicalInsurance: ['', '', ''],
        issues: 'Still gathering income verification'
      },
      contacts: [
        {
          name: 'Patricia Briggs (Daughter)',
          telephone: '(412) 555-8834',
          email: 'pbriggs@example.com',
          address: '812 Oak Meadow Ln, Seminole, FL 33772'
        }
      ],
      spouse: {
        name: 'Samuel Briggs',
        address: '812 Oak Meadow Ln, Seminole, FL 33772',
        phone: '(412) 555-4471',
        email: 'sambriggs@example.com',
        dob: '1949-05-22',
        age: 75,
        sex: 'Male',
        livingConditions: 'With Relative',
        health: 'Recently recovering from knee surgery.'
      },
      guardianship: null,
      medicaid: null
    }
  ]);

  readonly submittedReferrals = signal<ReferralRecord[]>([
    {
      id: 'ref-24015',
      resident: 'Anthony Morales',
      type: 'Guardianship',
      submitted: 'Jan 12, 2025',
      status: 'In Progress',
      submissionStatus: 'submitted',
      createdAt: '2025-01-05T14:00:00Z',
      submittedAt: '2025-01-12T10:15:00Z',
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
          telephone: '(813) 555-1024',
          email: 'maria.morales@example.com',
          address: '102 Lake Bluff Dr, Tampa, FL 33604'
        }
      ],
      spouse: null,
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
      submissionStatus: 'submitted',
      createdAt: '2024-11-25T16:00:00Z',
      submittedAt: '2024-12-03T11:30:00Z',
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
          telephone: '(941) 555-8410',
          email: 'thomas.robertson@example.com',
          address: '498 Palm Cove Ave, Sarasota, FL 34236'
        }
      ],
      spouse: null,
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
      submissionStatus: 'submitted',
      createdAt: '2024-11-01T08:00:00Z',
      submittedAt: '2024-11-18T09:45:00Z',
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
          telephone: '(727) 555-9902',
          email: 'samantha.hart@example.com',
          address: '77 Palmetto Ave, Dunedin, FL 34698'
        },
        {
          name: 'Dr. Steven Lutz',
          telephone: '(813) 555-7710',
          email: 'slutz@baymemoryclinic.com',
          address: 'Bay Memory Clinic, 201 Harbor Dr, Tampa, FL 33606'
        }
      ],
      spouse: {
        name: 'Patricia Hart',
        address: '1210 Sea Breeze Way, Clearwater, FL 33755',
        phone: '(727) 555-9903',
        email: 'patricia.hart@example.com',
        dob: '1954-01-19',
        age: 70,
        sex: 'Female',
        livingConditions: 'Assisted Living',
        health: 'Mobility limited; on dialysis schedule.'
      },
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

  readonly selectedReferralId = signal<string | null>(null);
  readonly selectedReferral = computed(() => {
    const id = this.selectedReferralId();
    if (!id) {
      return null;
    }
    return [...this.draftReferrals(), ...this.submittedReferrals()].find(ref => ref.id === id) ?? null;
  });
  readonly searchTerm = signal('');
  readonly filteredDrafts = computed(() => this.applyFilter(this.draftReferrals()));
  readonly filteredSubmissions = computed(() => this.applyFilter(this.submittedReferrals()));
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

  constructor(
    public authService: AuthService,
    private readonly referralService: FacilityReferralService
  ) {
    this.initializeSelection();
  }

  ngOnInit(): void {
    this.loadReferrals();
  }



  selectReferral(id: string): void {
    this.selectedReferralId.set(id);
  }

  updateSearch(term: string): void {
    this.searchTerm.set(term);
  }

  private loadReferrals(): void {
    this.referralService.listReferrals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (!rows.length) {
            this.draftReferrals.set([]);
            this.submittedReferrals.set([]);
            this.initializeSelection();
            return;
          }

          const drafts: ReferralRecord[] = [];
          const submitted: ReferralRecord[] = [];

          rows.forEach(dto => {
            const record = this.transformDto(dto);
            if (dto.submissionStatus === 'draft') {
              drafts.push(record);
            } else {
              submitted.push(record);
            }
          });

          this.draftReferrals.set(drafts);
          this.submittedReferrals.set(submitted);

          if (!this.selectedReferralId() || !this.findReferralById(this.selectedReferralId()!)) {
            this.initializeSelection();
          }
        },
        error: () => {
          // Remain on mock data but log the issue
          console.warn('Unable to load referrals from API');
        }
      });
  }

  onReferralSubmitted(): void {
    this.loadReferrals();
  }

  private initializeSelection(): void {
    const first = this.draftReferrals()[0] ?? this.submittedReferrals()[0] ?? null;
    this.selectedReferralId.set(first?.id ?? null);
  }

  private findReferralById(id: string): ReferralRecord | undefined {
    return [...this.draftReferrals(), ...this.submittedReferrals()].find(ref => ref.id === id);
  }

  private applyFilter(list: ReferralRecord[]): ReferralRecord[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return list;
    }
    return list.filter(ref => ref.resident.toLowerCase().includes(term));
  }

  private transformDto(dto: FacilityReferralDto): ReferralRecord {
    return {
      id: String(dto.referralId),
      resident: dto.fullLegalName,
      type: dto.caseType ?? null,
      submitted: dto.submissionStatus === 'draft'
        ? `Draft saved ${this.formatDate(dto.createdAt)}`
        : this.formatDate(dto.submittedAt ?? dto.createdAt),
      status: dto.submissionStatus === 'draft' ? 'Draft' : 'Submitted',
      submissionStatus: dto.submissionStatus,
      createdAt: dto.createdAt,
      submittedAt: dto.submittedAt,
      shared: {
        dob: dto.dateOfBirth ?? '',
        age: dto.age ?? '',
        sex: dto.sex ?? '',
        maritalStatus: dto.maritalStatus ?? '',
        homeAddress: dto.homeAddress ?? '',
        currentAddress: dto.currentAddress ?? '',
        monthlyIncome: dto.monthlyIncome ?? '',
        reason: dto.reasonForAssistance ?? '',
        physicalCondition: dto.physicalCondition ?? '',
        mentalCondition: dto.mentalCondition ?? '',
        existingEstatePlan: dto.existingEstatePlan ?? '',
        incapacityDate: dto.incapacityDate ?? '',
        deemedIncapacitated: dto.deemedIncapacitated ?? false,
        medicalInsurance: dto.medicalInsurance ?? ['', '', ''],
        issues: dto.issues ?? '',
        comments: dto.comments ?? ''
      },
      contacts: dto.contacts ?? [],
      spouse: dto.spouse ?? null,
      guardianship: dto.guardianship
        ? {
          estatePlan: dto.guardianship.estatePlan ?? [],
          guardianType: dto.guardianship.guardianType ?? null,
          interestedFamily: dto.guardianship.interestedFamily === 'yes',
          interestedPersons: dto.guardianship.interestedPersons ?? '',
          repPayeeStatus: dto.guardianship.repPayeeStatus ?? null,
          awareOfAssets: dto.guardianship.awareOfAssets ?? null,
          assetNotes: dto.guardianship.assetNotes ?? '',
          notes: dto.guardianship.notes ?? ''
        }
        : null,
      medicaid: dto.medicaid
        ? {
          applicationType: dto.medicaid.applicationType ?? null,
          filedBy: dto.medicaid.filedBy ?? '',
          caseNumber: dto.medicaid.caseNumber ?? '',
          applicationNumber: dto.medicaid.applicationNumber ?? '',
          dateOfApplication: dto.medicaid.dateOfApplication ?? '',
          dateNeeded: dto.medicaid.dateNeeded ?? '',
          privatePayEstimate: dto.medicaid.privatePayEstimate ?? '',
          status: dto.medicaid.status ?? null,
          lastNoca: dto.medicaid.lastNoca ?? '',
          nocaContents: dto.medicaid.nocaContents ?? '',
          notes: dto.medicaid.notes ?? ''
        }
        : null
    };
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private mapReferralToPrefill(referral: ReferralRecord): ReferralPrefillData {
    const facility = this.facilityDetails();
    const medicalInsurance = referral.shared.medicalInsurance ?? ['', '', ''];

    const contacts: ReferralContact[] = referral.contacts?.length
      ? referral.contacts.map(contact => ({
        name: contact.name || '',
        telephone: contact.telephone || '',
        address: contact.address || '',
        email: contact.email || ''
      }))
      : [{ name: '', telephone: '', address: '', email: '' }];

    let guardianship: GuardianshipFormData | null = null;
    if (referral.guardianship) {
      let interestedFamily: GuardianshipFormData['interestedFamily'] = null;
      if (referral.guardianship.interestedFamily === true) {
        interestedFamily = 'yes';
      } else if (referral.guardianship.interestedFamily === false) {
        interestedFamily = 'no';
      }
      guardianship = {
        estatePlan: referral.guardianship.estatePlan ?? [],
        guardianType: referral.guardianship.guardianType as GuardianshipFormData['guardianType'],
        interestedFamily,
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

    const providerName = referral.providerName ?? facility.provider_name;

    return {
      referralId: referral.id,
      submissionStatus: referral.submissionStatus,
      createdAt: referral.createdAt,
      providerName: referral.providerName ?? facility.provider_name,
      providerType: referral.providerType ?? facility.provider_type ?? null,
      caseType: referral.type ?? null,
      fullLegalName: referral.resident,
      dateOfBirth: referral.shared.dob ?? '',
      age: referral.shared.age ?? '',
      sex: referral.shared.sex ?? '',
      homeAddress: referral.shared.homeAddress ?? '',
      currentAddress: referral.shared.currentAddress ?? '',
      maritalStatus: referral.shared.maritalStatus ?? '',
      physicalCondition: referral.shared.physicalCondition ?? '',
      mentalCondition: referral.shared.mentalCondition ?? '',
      existingEstatePlan: referral.shared.existingEstatePlan ?? '',
      incapacityDate: referral.shared.incapacityDate ?? '',
      monthlyIncome: referral.shared.monthlyIncome ?? '',
      reasonForAssistance: referral.shared.reason ?? '',
      medicalInsurance,
      issues: referral.shared.issues ?? '',
      comments: referral.shared.comments ?? '',
      deemedIncapacitated: referral.shared.deemedIncapacitated ?? false,
      contacts,
      guardianship,
      medicaid,
      spouse: referral.spouse ?? null
    };
  }
}

