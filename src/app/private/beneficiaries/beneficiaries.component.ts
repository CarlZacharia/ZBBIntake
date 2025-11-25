import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiariesService } from '../../services/beneficiaries.service';

@Component({
  selector: 'app-beneficiaries',
  imports: [CommonModule, FormsModule],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css'],
  providers: [BeneficiariesService]
})
export class BeneficiariesComponent {
  children: any[] = [];
  familyMembers: any[] = [];
  charities: any[] = [];

  editingType: string | null = null;
  editingIndex: number | null = null;
  editingItem: any = null;

  constructor(private beneficiariesService: BeneficiariesService) {
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.beneficiariesService.getChildren().subscribe(children => {
      this.children = children;
    });
    this.beneficiariesService.getFamilyMembers().subscribe(family => {
      this.familyMembers = family;
    });
    this.beneficiariesService.getCharities().subscribe(charities => {
      this.charities = charities;
    });
  }

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
    // TODO: Use data.service.ts removeChild logic
    this.children.splice(index, 1);
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
    // TODO: Use data.service.ts removeFamilyMember logic
    this.familyMembers.splice(index, 1);
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
    // TODO: Use data.service.ts removeCharity logic
    this.charities.splice(index, 1);
    if (this.editingType === 'charity' && this.editingIndex === index) {
      this.cancelEdit();
    }
  }

  saveEdit() {
    if (this.editingType === 'child') {
      if (this.editingIndex === this.children.length) {
        // TODO: Use data.service.ts addChild logic
        this.children.push(this.editingItem);
      } else if (this.editingIndex !== null) {
        // TODO: Use data.service.ts updateChild logic
        this.children[this.editingIndex] = this.editingItem;
      }
    } else if (this.editingType === 'family') {
      if (this.editingIndex === this.familyMembers.length) {
        // TODO: Use data.service.ts addFamilyMember logic
        this.familyMembers.push(this.editingItem);
      } else if (this.editingIndex !== null) {
        // TODO: Use data.service.ts updateFamilyMember logic
        this.familyMembers[this.editingIndex] = this.editingItem;
      }
    } else if (this.editingType === 'charity') {
      if (this.editingIndex === this.charities.length) {
        // TODO: Use data.service.ts addCharity logic
        this.charities.push(this.editingItem);
      } else if (this.editingIndex !== null) {
        // TODO: Use data.service.ts updateCharity logic
        this.charities[this.editingIndex] = this.editingItem;
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
