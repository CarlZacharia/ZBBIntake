import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ICharity } from '../../models/case_data';

@Component({
  selector: 'app-charities',
  imports: [CommonModule, FormsModule],
  templateUrl: './charities.component.html',
  styleUrls: ['./charities.component.css']
})
export class CharitiesComponent {

  // Modal visibility flags
  showAddCharityModal = false;
  showEditCharityModal = false;

  // Current edit items
  editingCharity: ICharity | null = null;
  editingCharityIndex: number = -1;

  // Reactive data access
  readonly charities = computed(() => this.ds.clientdata().charities);

  // US States array for dropdowns
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  constructor(public ds: DataService) { }

  // --- Charity Methods ---

  openAddCharityModal() {
    this.editingCharity = this.createEmptyCharity();
    this.showAddCharityModal = true;
  }

  openEditCharityModal(charity: ICharity, index: number) {
    this.editingCharity = { ...charity };
    this.editingCharityIndex = index;
    this.showEditCharityModal = true;
  }

  saveNewCharity() {
    if (this.editingCharity) {
      this.ds.addCharity(this.editingCharity);
      this.closeAddCharityModal();
    }
  }

  saveEditCharity() {
    if (this.editingCharity && this.editingCharityIndex >= 0) {
      this.ds.updateCharity(this.editingCharityIndex, this.editingCharity);
      this.closeEditCharityModal();
    }
  }

  deleteCharity(index: number) {
    if (confirm('Are you sure you want to delete this charity?')) {
      this.ds.removeCharity(index);
    }
  }

  closeAddCharityModal() {
    this.showAddCharityModal = false;
    this.editingCharity = null;
  }

  closeEditCharityModal() {
    this.showEditCharityModal = false;
    this.editingCharity = null;
    this.editingCharityIndex = -1;
  }

  createEmptyCharity(): ICharity {
    return {
      charity_id: null,
      organization_name: '',
      ein_tax_id: null,
      charity_type: 'other',
      mission_description: null,
      website: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      contact_person: null,
      contact_phone: null,
      contact_email: null,
      current_donor: false,
      annual_contribution_amount: null,
      years_supporting: null,
      personal_connection: null,
      intended_gift_type: null,
      intended_percentage: null,
      intended_dollar_amount: null,
      intended_asset_description: null,
      gift_restrictions: null,
      memorial_gift: false,
      memorial_name: null,
      endowment_fund: false,
      endowment_purpose: null,
      recognition_preferences: null,
      notes: null
    };
  }
}
