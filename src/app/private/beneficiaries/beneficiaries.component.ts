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
    this.editingItem = { name: '' };
  }
  editChild(index: number) {
    this.editingType = 'child';
    this.editingIndex = index;
    this.editingItem = { ...this.children[index] };
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
    this.editingItem = { name: '' };
  }
  editFamilyMember(index: number) {
    this.editingType = 'family';
    this.editingIndex = index;
    this.editingItem = { ...this.familyMembers[index] };
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
    this.editingItem = { charity_name: '' };
  }
  editCharity(index: number) {
    this.editingType = 'charity';
    this.editingIndex = index;
    this.editingItem = { ...this.charities[index] };
  }
  removeCharity(index: number) {
    this.dataService.removeCharity(index);
    if (this.editingType === 'charity' && this.editingIndex === index) {
      this.cancelEdit();
    }
  }

  saveEdit() {
    if (this.editingType === 'child') {
      if (this.editingIndex === this.children.length) {
        this.dataService.addChild(this.editingItem);
      } else if (this.editingIndex !== null) {
        this.dataService.updateChild(this.editingIndex, this.editingItem);
      }
    } else if (this.editingType === 'family') {
      if (this.editingIndex === this.familyMembers.length) {
        this.dataService.addFamilyMember(this.editingItem);
      } else if (this.editingIndex !== null) {
        this.dataService.updateFamilyMember(this.editingIndex, this.editingItem);
      }
    } else if (this.editingType === 'charity') {
      if (this.editingIndex === this.charities.length) {
        this.dataService.addCharity(this.editingItem);
      } else if (this.editingIndex !== null) {
        this.dataService.updateCharity(this.editingIndex, this.editingItem);
      }
    }
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingType = null;
    this.editingIndex = null;
    this.editingItem = null;
  }
}
