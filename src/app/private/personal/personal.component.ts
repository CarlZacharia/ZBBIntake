import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ICaseData, IAddress } from '../../models/case_data';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css'
})
export class PersonalComponent {

  // US States array for dropdown
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  militaryBranches = [
    'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard',
    'Space Force', 'National Guard', 'Reserves'
  ];

  // State signals for component-specific concerns
  private _isSaving = signal(false);
  private _saveMessage = signal<string | null>(null);

  // Computed signals for reactive UI
  readonly isSaving = this._isSaving.asReadonly();
  readonly saveMessage = this._saveMessage.asReadonly();

  // Reactive computed properties from the data service
  readonly personal = computed(() => this.ds.personal());
  readonly maritalInfo = computed(() => this.ds.maritalInfo());
  readonly casedata = computed(() => this.ds.casedata());
  readonly isPersonalInfoComplete = computed(() => this.ds.isPersonalInfoComplete());
  readonly completionPercentage = computed(() => this.ds.completionPercentage());

  // Computed signals for UI state
  readonly canSave = computed(() => {
    const personal = this.personal();
    return !!(personal.legal_first_name && personal.legal_last_name) && !this.isSaving();
  });

  readonly previousAddressesCount = computed(() => this.personal().previous_addresses.length);

  readonly formValidationMessage = computed(() => {
    const personal = this.personal();
    if (!personal.legal_first_name) return 'First name is required';
    if (!personal.legal_last_name) return 'Last name is required';
    if (!personal.current_address.address_line1) return 'Address is required';
    if (!personal.current_address.city) return 'City is required';
    if (!personal.current_address.state) return 'State is required';
    if (!personal.current_address.zip) return 'ZIP code is required';
    return null;
  });

  constructor(public ds: DataService) { }

  // Backwards compatibility getter - can be removed if not used elsewhere
  get csd(): ICaseData {
    return this.ds.casedata();
  }

  // Methods using the new signal-based data service
  addPreviousAddress() {
    const newAddress: IAddress = {
      address_line1: '',
      address_line2: null,
      city: '',
      state: '',
      zip: ''
    };
    this.ds.addPreviousAddress(newAddress);
  }

  removePreviousAddress(index: number) {
    this.ds.removePreviousAddress(index);
  }

  updatePersonalInfo(field: string, value: any) {
    this.ds.updatePersonal({ [field]: value });
  }

  updateMaritalInfo(field: string, value: any) {
    this.ds.updateMaritalInfo({ [field]: value });
  }

  updateAddress(field: string, value: any) {
    this.ds.updatePersonalAddress({ [field]: value });
  }

  updatePreviousAddress(index: number, field: string, value: any) {
    this.ds.updatePreviousAddress(index, { [field]: value });
  }

  // Event handler methods for type safety
  onInputChange(field: string, event: Event, updateFn: (field: string, value: any) => void) {
    const target = event.target as HTMLInputElement;
    updateFn(field, target.value || null);
  }

  onSelectChange(field: string, event: Event, updateFn: (field: string, value: any) => void) {
    const target = event.target as HTMLSelectElement;
    updateFn(field, target.value || null);
  }

  onCheckboxChange(field: string, event: Event, updateFn: (field: string, value: any) => void) {
    const target = event.target as HTMLInputElement;
    updateFn(field, target.checked);
  }

  async savePersonalInfo() {
    if (!this.canSave()) return;

    this._isSaving.set(true);
    this._saveMessage.set(null);

    try {
      const success = await this.ds.savePersonalInfo();
      if (success) {
        this._saveMessage.set('Personal information saved successfully!');
        setTimeout(() => this._saveMessage.set(null), 3000);
      } else {
        this._saveMessage.set('Failed to save personal information. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      this._saveMessage.set('An error occurred while saving. Please try again.');
    } finally {
      this._isSaving.set(false);
    }
  }
}
