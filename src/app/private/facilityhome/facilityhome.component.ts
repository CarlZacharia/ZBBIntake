import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-facilityhome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './facilityhome.component.html',
  styleUrl: './facilityhome.component.css'
})
export class FacilityhomeComponent {
  readonly facilityDetails = signal({
    name: 'Oakridge Senior Living',
    address: '742 Evergreen Terrace • Tampa, FL',
    contact: 'Marianne Whitaker',
    contactEmail: 'mwhitaker@oakridgecare.com',
    contactPhone: '(813) 555-2038'
  });

  readonly previousIntakes = signal([
    {
      resident: 'Anthony Morales',
      type: 'Guardianship',
      submitted: 'Jan 12, 2025',
      status: 'In Progress'
    },
    {
      resident: 'Helen Robertson',
      type: 'Medicaid',
      submitted: 'Dec 3, 2024',
      status: 'Approved'
    },
    {
      resident: 'Michael & Patricia Hart',
      type: 'Both',
      submitted: 'Nov 18, 2024',
      status: 'Awaiting Docs'
    }
  ]);

  readonly loggedInContact = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return {
        name: '—',
        email: '—',
        phone: '—'
      };
    }
    return {
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone || 'Not provided'
    };
  });

  constructor(public authService: AuthService) { }
}

