import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacilityService, FacilityProfile } from '../../../services/facility.service';

@Component({
  selector: 'app-facilityprofile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facilityprofile.component.html',
  styleUrl: './facilityprofile.component.css'
})
export class FacilityProfileComponent {
  providerName: string = '';
  facilityAddress: string = '';
  facilityCsz: string = '';
  facilityCounty: string = '';
  facilityContact: string = '';
  facilityEmail: string = '';
  facilityPhone: string = '';

  constructor(private router: Router, private facilityService: FacilityService) {}

  goBack() {
    const profile: FacilityProfile = {
      providerName: this.providerName,
      facilityAddress: this.facilityAddress,
      facilityCsz: this.facilityCsz,
      facilityCounty: this.facilityCounty,
      facilityContact: this.facilityContact,
      facilityEmail: this.facilityEmail,
      facilityPhone: this.facilityPhone
    };
    this.facilityService.saveFacilityProfile(profile).subscribe({
      next: () => this.router.navigate(['/facilityhome']),
      error: () => this.router.navigate(['/facilityhome']) // fallback on error
    });
  }
}
