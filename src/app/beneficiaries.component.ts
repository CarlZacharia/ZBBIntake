import { Component } from '@angular/core';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css']
})
export class BeneficiariesComponent {
  // This will eventually hold all children, family members, and charities
  beneficiaries: any[] = [];
  // Add logic for fetching, adding, editing, deleting beneficiaries here
}
