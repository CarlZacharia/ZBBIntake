import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type GuardianType = 'person' | 'property' | 'plenary';
type YesNo = 'yes' | 'no';
type RepPayeeStatus = 'yes' | 'no' | 'applied';
type AssetAwareness = 'yes' | 'no' | 'unsure';

interface FamilyContact {
  name: string;
  address: string;
  email: string;
  telephone: string;
}

@Component({
  selector: 'app-guardianship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guardianship.component.html',
  styleUrl: './guardianship.component.css'
})
export class GuardianshipComponent {
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

  readonly familyContacts = signal<FamilyContact[]>([
    { name: '', address: '', email: '', telephone: '' }
  ]);

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

  updateFamilyContact(index: number, field: keyof FamilyContact, value: string): void {
    this.familyContacts.update(list => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
}

