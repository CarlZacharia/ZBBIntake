import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IAddress } from '../../models/case_data';

@Component({
  selector: 'app-personal',
  imports: [CommonModule, FormsModule],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
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

  constructor(public ds: DataService) { }

  addPreviousAddress() {
    const newAddress: IAddress = {
      address_line1: '',
      address_line2: null,
      city: '',
      state: '',
      zip: ''
    };
    this.ds.personal.previous_addresses.push(newAddress);
  }

  removePreviousAddress(index: number) {
    this.ds.personal.previous_addresses.splice(index, 1);
  }

  savePersonalInfo() {
    console.log('Saving personal information:', this.ds.personal);
    // Add your save logic here (e.g., API call)
  }
}
