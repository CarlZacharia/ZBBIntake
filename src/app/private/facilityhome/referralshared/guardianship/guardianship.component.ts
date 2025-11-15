import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AssetAwareness,
  GuardianshipFormData,
  RepPayeeStatus,
  GuardianType,
  YesNo,
  ReferralContact
} from '../referral-shared.types';

@Component({
  selector: 'app-guardianship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guardianship.component.html',
  styleUrl: './guardianship.component.css'
})
export class GuardianshipComponent implements OnChanges {
  @Input() initialState: GuardianshipFormData | null = null;

  readonly estatePlanOptions = [
    'Power of Attorney',
    'Health Care Surrogate',
    'Health Care Proxy',
    'Trust',
    'Living Will',
    'DNR'
  ];

  readonly guardianshipState = signal({
    estatePlan: new Set<string>(),
    guardianType: null as GuardianType | null,
    interestedFamily: null as YesNo | null,
    interestedPersons: '',
    repPayee: null as RepPayeeStatus | null,
    awareOfAssets: null as AssetAwareness | null,
    assetNotes: '',
    notes: ''
  });

  readonly familyContacts = signal<ReferralContact[]>([
    { name: '', address: '', email: '', telephone: '' }
  ]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialState']) {
      this.applyInitialState(changes['initialState'].currentValue as GuardianshipFormData | null);
    }
  }

  private applyInitialState(state: GuardianshipFormData | null): void {
    if (!state) {
      return;
    }

    this.guardianshipState.update(current => ({
      ...current,
      estatePlan: new Set(state.estatePlan ?? []),
      guardianType: state.guardianType ?? null,
      interestedFamily: state.interestedFamily ?? null,
      interestedPersons: state.interestedPersons ?? '',
      repPayee: state.repPayeeStatus ?? null,
      awareOfAssets: state.awareOfAssets ?? null,
      assetNotes: state.assetNotes ?? '',
      notes: state.notes ?? ''
    }));

    if (state.familyContacts && state.familyContacts.length) {
      this.familyContacts.set(
        state.familyContacts.map(contact => ({
          name: contact.name || '',
          address: contact.address || '',
          email: contact.email || '',
          telephone: contact.telephone || ''
        }))
      );
    } else {
      this.familyContacts.set([{ name: '', address: '', email: '', telephone: '' }]);
    }
  }

  toggleEstatePlan(option: string): void {
    this.guardianshipState.update(state => {
      const next = new Set(state.estatePlan);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return { ...state, estatePlan: next };
    });
  }

  setGuardianType(type: GuardianType): void {
    this.guardianshipState.update(state => ({ ...state, guardianType: type }));
  }

  setInterestedFamily(choice: YesNo): void {
    this.guardianshipState.update(state => ({
      ...state,
      interestedFamily: choice,
      interestedPersons: choice === 'yes' ? state.interestedPersons : ''
    }));
  }

  setRepPayee(status: RepPayeeStatus): void {
    this.guardianshipState.update(state => ({ ...state, repPayee: status }));
  }

  setAssetAwareness(choice: AssetAwareness): void {
    this.guardianshipState.update(state => ({
      ...state,
      awareOfAssets: choice,
      assetNotes: choice === 'yes' ? state.assetNotes : ''
    }));
  }

  updateField<K extends keyof ReturnType<typeof this.guardianshipState>>(key: K, value: ReturnType<typeof this.guardianshipState>[K]): void {
    this.guardianshipState.update(state => ({
      ...state,
      [key]: value
    }));
  }

  addFamilyContact(): void {
    this.familyContacts.update(list => [
      ...list,
      { name: '', address: '', email: '', telephone: '' }
    ]);
  }

  removeFamilyContact(index: number): void {
    this.familyContacts.update(list => list.filter((_, i) => i !== index));
  }

  updateFamilyContact(index: number, field: keyof ReferralContact, value: string): void {
    this.familyContacts.update(list => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  getState(): GuardianshipFormData {
    const state = this.guardianshipState();
    return {
      estatePlan: Array.from(state.estatePlan),
      guardianType: state.guardianType,
      interestedFamily: state.interestedFamily,
      interestedPersons: state.interestedPersons,
      repPayeeStatus: state.repPayee,
      awareOfAssets: state.awareOfAssets,
      assetNotes: state.assetNotes,
      notes: state.notes,
      familyContacts: this.familyContacts()
    };
  }
}

