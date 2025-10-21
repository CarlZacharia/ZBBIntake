import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IChild, IFamilyMember } from '../../models/case_data';

@Component({
  selector: 'app-children',
  imports: [CommonModule, FormsModule],
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent {

  // Modal visibility flags
  showAddChildModal = false;
  showEditChildModal = false;
  showAddFamilyMemberModal = false;
  showEditFamilyMemberModal = false;

  // Current edit items
  editingChild: IChild | null = null;
  editingChildIndex: number = -1;
  editingFamilyMember: IFamilyMember | null = null;
  editingFamilyMemberIndex: number = -1;

  // Reactive data access
  readonly children = computed(() => this.ds.children());
  readonly familyMembers = computed(() => this.ds.casedata().family_members);

  // US States array for dropdowns
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  constructor(public ds: DataService) { }

  // --- Child Methods ---

  openAddChildModal() {
    this.editingChild = this.createEmptyChild();
    this.showAddChildModal = true;
  }

  openEditChildModal(child: IChild, index: number) {
    this.editingChild = { ...child };
    this.editingChildIndex = index;
    this.showEditChildModal = true;
  }

  saveNewChild() {
    if (this.editingChild) {
      this.ds.addChild(this.editingChild);
      this.closeAddChildModal();
    }
  }

  saveEditChild() {
    if (this.editingChild && this.editingChildIndex >= 0) {
      this.ds.updateChild(this.editingChildIndex, this.editingChild);
      this.closeEditChildModal();
    }
  }

  deleteChild(index: number) {
    if (confirm('Are you sure you want to delete this child?')) {
      this.ds.removeChild(index);
    }
  }

  closeAddChildModal() {
    this.showAddChildModal = false;
    this.editingChild = null;
  }

  closeEditChildModal() {
    this.showEditChildModal = false;
    this.editingChild = null;
    this.editingChildIndex = -1;
  }

  createEmptyChild(): IChild {
    return {
      child_id: null,
      legal_first_name: '',
      legal_middle_name: null,
      legal_last_name: '',
      suffix: null,
      date_of_birth: null,
      child_of: 'both',
      child_comment: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      marital_status: null,
      has_children: false,
      special_needs: false,
      special_needs_description: null,
      disabilities: null,
      relationship_quality: null,
      financially_responsible: null,
      substance_abuse_concerns: false,
      gambling_concerns: false,
      other_concerns: null,
      excluded_or_reduced: false,
      exclusion_reason: null,
      is_deceased: false,
      date_of_death: null,
      surviving_spouse: null
    };
  }

  // --- Family Member Methods ---

  openAddFamilyMemberModal() {
    this.editingFamilyMember = this.createEmptyFamilyMember();
    this.showAddFamilyMemberModal = true;
  }

  openEditFamilyMemberModal(familyMember: IFamilyMember, index: number) {
    this.editingFamilyMember = { ...familyMember };
    this.editingFamilyMemberIndex = index;
    this.showEditFamilyMemberModal = true;
  }

  saveNewFamilyMember() {
    if (this.editingFamilyMember) {
      this.ds.addFamilyMember(this.editingFamilyMember);
      this.closeAddFamilyMemberModal();
    }
  }

  saveEditFamilyMember() {
    if (this.editingFamilyMember && this.editingFamilyMemberIndex >= 0) {
      this.ds.updateFamilyMember(this.editingFamilyMemberIndex, this.editingFamilyMember);
      this.closeEditFamilyMemberModal();
    }
  }

  deleteFamilyMember(index: number) {
    if (confirm('Are you sure you want to delete this family member?')) {
      this.ds.removeFamilyMember(index);
    }
  }

  closeAddFamilyMemberModal() {
    this.showAddFamilyMemberModal = false;
    this.editingFamilyMember = null;
  }

  closeEditFamilyMemberModal() {
    this.showEditFamilyMemberModal = false;
    this.editingFamilyMember = null;
    this.editingFamilyMemberIndex = -1;
  }

  createEmptyFamilyMember(): IFamilyMember {
    return {
      family_id: null,
      relationship: 'other',
      legal_name: '',
      date_of_birth: null,
      is_living: true,
      date_of_death: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      financial_support: false,
      support_amount_monthly: null,
      special_needs: false,
      caregiving_responsibilities: false,
      notes: null
    };
  }
}
