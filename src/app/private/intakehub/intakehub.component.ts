import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showIntakeOptions: boolean = false;

  constructor(public authService: AuthService) {
    // Method 1: Using effect to reactively log user data whenever it changes
    effect(() => {
      const currentUser = this.authService.currentUser();
      const isAuthenticated = this.authService.isAuthenticated();
      const userId = this.authService.getCurrentUserId();

      console.log('=== Auth Data (from effect) ===');
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Current User:', currentUser);
      console.log('User ID:', userId);

      if (currentUser) {
        console.log('User Name:', `${currentUser.first_name} ${currentUser.last_name}`);
        console.log('User Email:', currentUser.email);
        console.log('User Phone:', currentUser.phone);
      }
      console.log('==============================');
    });

    // Method 2: Log auth data immediately on component initialization
    this.logUserData();
  }

  logUserData(): void {
    console.log('=== Manual Auth Data Access ===');

    // Access computed signals directly
    const authState = this.authService.authState();
    const currentUser = this.authService.currentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.token();
    const userId = this.authService.getCurrentUserId();

    console.log('Full Auth State:', authState);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Current User Object:', currentUser);
    console.log('User ID:', userId);
    console.log('Token (first 20 chars):', token?.substring(0, 20) + '...');

    if (currentUser) {
      console.log('User Details:');
      console.log('  - Name:', `${currentUser.first_name} ${currentUser.last_name}`);
      console.log('  - Email:', currentUser.email);
      console.log('  - Phone:', currentUser.phone);
      console.log('  - User ID:', currentUser.user_id);
      console.log('  - Preferred Contact:', currentUser.preferred_contact_method);
      console.log('  - Date Created:', currentUser.date_created);
      console.log('  - Last Login:', currentUser.last_login);
      console.log('  - Email Verified:', currentUser.email_verified);
      console.log('  - Profile Completed:', currentUser.profile_completed);
    } else {
      console.log('No user data available');
    }

    console.log('===============================');
  }

  toggleIntakeOptions(opt: boolean) {
    console.log(opt);
    this.showIntakeOptions = opt;

    // Example: Access user data when toggling options
    const user = this.authService.currentUser();
    if (user) {
      console.log(`User ${user.first_name} ${user.last_name} toggled intake options to:`, opt);
    }
  }

  logout(): void {
    console.log('User logging out...');
    const user = this.authService.currentUser();
    if (user) {
      console.log(`Logging out user: ${user.first_name} ${user.last_name} (ID: ${user.user_id})`);
    }
    this.authService.logout();
  }
}
