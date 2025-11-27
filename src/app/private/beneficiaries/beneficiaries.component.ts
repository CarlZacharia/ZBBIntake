import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-beneficiaries',
  imports: [CommonModule, FormsModule],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css'],
  providers: [DataService]
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

  constructor(public dataService: DataService) {}

  // No need for ngOnInit; data is always up-to-date via getters

  // Children
  addChild() {
    this.editingType = 'child';
    this.editingIndex = this.children.length;
    this.editingItem = {
      legal_first_name: '',
      legal_last_name: '',
      substance_abuse: false,
      gamblnig_concerns: false,
      has_children: false,
      excluded_or_reduced: false,
      i_deceased: false
    };
  }
  editChild(index: number) {
    this.editingType = 'child';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({ ...this.children[index] });
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
      legal_first_name: '',
      legal_last_name: '',
      substance_abuse: false,
      gamblnig_concerns: false,
      has_children: false,
      excluded_or_reduced: false,
      i_deceased: false
    };
  }
  editFamilyMember(index: number) {
    this.editingType = 'family';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({ ...this.familyMembers[index] });
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
      charity_name: '',
      substance_abuse: false,
      gamblnig_concerns: false,
      has_children: false,
      excluded_or_reduced: false,
      i_deceased: false
    };
  }
  editCharity(index: number) {
    this.editingType = 'charity';
    this.editingIndex = index;
    this.editingItem = this.convertCheckboxFieldsToBoolean({ ...this.charities[index] });
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
      'gamblnig_concerns',
      'has_children',
      'excluded_or_reduced',
      'i_deceased'
    ];
    fields.forEach(f => {
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
      'gamblnig_concerns',
      'has_children',
      'excluded_or_reduced',
      'i_deceased'
    ];
    const newItem = { ...item };
    fields.forEach(f => {
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
