import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import {
  IBeneficiaryConcern,
  IChild,
  IConcernCategory,
} from '../../models/case_data';

@Component({
  selector: 'app-beneficiaries',
  imports: [CommonModule, FormsModule],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css'],
  providers: [DataService],
})
export class BeneficiariesComponent {
  get isAddMode(): boolean {
    if (this.editingType === 'child') {
      return this.editingIndex === this.children.length;
    } else if (this.editingType === 'family') {
      return this.editingIndex === this.familyMembers.length;
    } else if (this.editingType === 'charity') {
      return this.editingIndex === this.charities.length;
    }
    return false;
  }
  get children() {
    return this.dataService.children();
  }
  get familyMembers() {
    return this.dataService.clientdata().family_members || [];
  }
  get charities() {
    return this.dataService.clientdata().charities || [];
  }

  editingType: string | null = null;
  editingIndex: number | null = null;
  editingItem: any = null;
  concernCategories: IConcernCategory[] = [];
  private allConcerns: IBeneficiaryConcern[] = [];

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadClientData().subscribe((data) => {
      if (data) {
        const cleanData = this.dataService.convertBooleans(data);
        // Convert concern_ids and assigned_ids to arrays of numbers for children, family members, charities
        if (Array.isArray(cleanData.children)) {
          cleanData.children = cleanData.children.map((child: any) => {
            if (Array.isArray(child.concern_ids)) {
              child.concern_ids = child.concern_ids.map((id: any) =>
                Number(id)
              );
            }
            if (Array.isArray(child.assigned_ids)) {
              child.assigned_ids = child.assigned_ids.map((id: any) =>
                Number(id)
              );
            }
            return child;
          });
        }
        if (Array.isArray(cleanData.family_members)) {
          cleanData.family_members = cleanData.family_members.map((fm: any) => {
            if (Array.isArray(fm.concern_ids)) {
              fm.concern_ids = fm.concern_ids.map((id: any) => Number(id));
            }
            if (Array.isArray(fm.assigned_ids)) {
              fm.assigned_ids = fm.assigned_ids.map((id: any) => Number(id));
            }
            return fm;
          });
        }
        if (Array.isArray(cleanData.charities)) {
          cleanData.charities = cleanData.charities.map((charity: any) => {
            if (Array.isArray(charity.concern_ids)) {
              charity.concern_ids = charity.concern_ids.map((id: any) =>
                Number(id)
              );
            }
            if (Array.isArray(charity.assigned_ids)) {
              charity.assigned_ids = charity.assigned_ids.map((id: any) =>
                Number(id)
              );
            }
            return charity;
          });
        }
        // Use cleanData in your component
        if (cleanData.beneficiary_concern_categories) {
          this.concernCategories = cleanData.beneficiary_concern_categories;
          this.allConcerns = this.concernCategories.flatMap(
            (cat) => cat.concerns
          );
        } else {
          this.concernCategories = [];
          this.allConcerns = [];
        }
      }
    });
  }

  // loadConcernCategories() removed; concerns now loaded from API response

  toggleConcern(concernId: string | number): void {
    const id = Number(concernId); // Normalize to number
    if (!this.editingItem.concern_ids) {
      this.editingItem.concern_ids = [];
    }
    const index = this.editingItem.concern_ids.indexOf(id);
    if (index === -1) {
      this.editingItem.concern_ids.push(id);
    } else {
      this.editingItem.concern_ids.splice(index, 1);
    }
    // If any concerns are selected, force haveConcerns to true
    this.editingItem.haveConcerns = this.editingItem.concern_ids.length > 0 ? true : this.editingItem.haveConcerns;
    this.saveConcernAssignments();
  }

  saveConcernAssignments() {
    const type = this.editingType;
    const item = this.editingItem;
    const userId = this.dataService.pui;
    if (!type || !item || !userId) return;

    let table = '';
    let idField = '';
    let idValue = null;
    if (type === 'child') {
      table = 'child';
      idField = 'child_id';
      idValue = item.child_id;
    } else if (type === 'family') {
      table = 'family_member';
      idField = 'family_member_id';
      idValue = item.family_member_id;
    } else if (type === 'charity') {
      table = 'charity';
      idField = 'charity_id';
      idValue = item.charity_id;
    }
    if (!table || !idField || !idValue) return;

    this.dataService
      .saveClientSection(
        table,
        {
          ...item,
          concern_ids: item.concern_ids,
          portal_user_id: userId,
          action: 'update',
          [idField]: idValue,
        },
        idField
      )
      .subscribe();
  }

getConcernById(concernId: number | string): any {
  const id = Number(concernId);
  for (const category of this.concernCategories) {
    const found = category.concerns.find((c: any) => Number(c.id) === id);
    if (found) {
      return found;
    }
  }
  return null;
}

  get hasTrustIndicator(): boolean {
    if (!this.editingItem.concern_ids?.length) return false;
    return this.editingItem.concern_ids.some(
      (id: number) => this.getConcernById(id)?.suggests_trust
    );
  }

  get hasSntIndicator(): boolean {
    if (!this.editingItem.concern_ids?.length) return false;
    return this.editingItem.concern_ids.some(
      (id: number) => this.getConcernById(id)?.suggests_snt
    );
  }

  // Children
  addChild() {
    this.editingType = 'child';
    this.editingIndex = this.children.length;
    this.editingItem = {
      legal_first_name: '',
      legal_middle_name: '',
      legal_last_name: '',
      has_children: false,
      excluded_or_reduced: false,
      haveConcerns: null,
      concern_ids: [],
    };
  }
  editChild(index: number) {
    this.editingType = 'child';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({
      ...this.children[index],
    });
    // Ensure concern_ids is always an array of numbers
    if (Array.isArray(this.editingItem.concern_ids)) {
      this.editingItem.concern_ids = this.editingItem.concern_ids.map(
        (id: string | number) => Number(id)
      );
    }
    // Set haveConcerns to true if any concerns exist
    this.editingItem.haveConcerns = (this.editingItem.concern_ids && this.editingItem.concern_ids.length > 0) ? true : this.editingItem.haveConcerns;
  }
  removeChild(index: number) {
    this.dataService.removeChild(index);
    if (this.editingType === 'child' && this.editingIndex === index) {
      this.cancelEdit();
    }
  }

  // Family Members
addFamilyMember() {
  this.editingType = 'family';
  this.editingIndex = this.familyMembers.length;
  this.editingItem = {
    legal_name: '',
    relationship: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    concern_ids: [],
    concern_notes: '',
    notes: '',
    haveConcerns: null,
  };
}

  editFamilyMember(index: number) {
    this.editingType = 'family';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({
      ...this.familyMembers[index],
    });
    // Ensure concern_ids is always an array of numbers
    if (Array.isArray(this.editingItem.concern_ids)) {
      this.editingItem.concern_ids = this.editingItem.concern_ids.map(
        (id: string | number) => Number(id)
      );
    }
    // Set haveConcerns to true if any concerns exist
    this.editingItem.haveConcerns = (this.editingItem.concern_ids && this.editingItem.concern_ids.length > 0) ? true : this.editingItem.haveConcerns;
  }
  removeFamilyMember(index: number) {
    this.dataService.removeFamilyMember(index);
    if (this.editingType === 'family' && this.editingIndex === index) {
      this.cancelEdit();
    }
  }

  // Charities
  addCharity() {
    this.editingType = 'charity';
    this.editingIndex = this.charities.length;
    this.editingItem = {
      organization_name: '',
    };
  }
  editCharity(index: number) {
    this.editingType = 'charity';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({
      ...this.charities[index],
    });
    // Ensure concern_ids is always an array of numbers
    if (Array.isArray(this.editingItem.concern_ids)) {
      this.editingItem.concern_ids = this.editingItem.concern_ids.map(
        (id: string | number) => Number(id)
      );
    }
  }
  removeCharity(index: number) {
    this.dataService.removeCharity(index);
    if (this.editingType === 'charity' && this.editingIndex === index) {
      this.cancelEdit();
    }
  }


  saveEdit() {
    // Convert boolean fields back to 0/1 before saving
    const itemToSave = this.convertCheckboxFieldsToInt(this.editingItem);
    // Convert haveConcerns to 'Yes'/'No' string for DB
    if (typeof itemToSave.haveConcerns === 'boolean') {
      itemToSave.haveConcerns = itemToSave.haveConcerns ? 'Yes' : 'No';
    }
    if (this.editingType === 'child') {
      if (this.editingIndex === this.children.length) {
        this.dataService.addChild(itemToSave);
      } else if (this.editingIndex !== null) {
        this.dataService.updateChild(this.editingIndex, itemToSave);
      }
    } else if (this.editingType === 'family') {
      if (this.editingIndex === this.familyMembers.length) {
        this.dataService.addFamilyMember(itemToSave);
      } else if (this.editingIndex !== null) {
        this.dataService.updateFamilyMember(this.editingIndex, itemToSave);
      }
    } else if (this.editingType === 'charity') {
      if (this.editingIndex === this.charities.length) {
        this.dataService.addCharity(itemToSave);
      } else if (this.editingIndex !== null) {
        this.dataService.updateCharity(this.editingIndex, itemToSave);
      }
    }
    this.cancelEdit();
  }
  // Utility: convert integer fields to booleans for UI
  convertCheckboxFieldsToBoolean(item: any): any {
    const fields = [
      'substance_abuse',
      'excluded_or_reduced',
      'i_deceased',
    ];
    fields.forEach((f) => {
      if (item.hasOwnProperty(f)) {
        item[f] = item[f] === 1 ? true : false;
      }
    });
    return item;
  }

  // Utility: convert booleans to integer for saving
  convertCheckboxFieldsToInt(item: any): any {
    const fields = [
      'substance_abuse',
      'excluded_or_reduced',
    ];
    const newItem = { ...item };
    fields.forEach((f) => {
      if (newItem.hasOwnProperty(f)) {
        newItem[f] = newItem[f] ? 1 : 0;
      }
    });
    return newItem;
  }

  cancelEdit() {
    this.editingType = null;
    this.editingIndex = null;
    this.editingItem = null;
  }
}
