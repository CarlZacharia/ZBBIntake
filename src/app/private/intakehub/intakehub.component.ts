import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showIntakeOptions: boolean = false;

  constructor(public authService: AuthService, public ds: DataService) {
    // Method 1: Using effect to reactively log user data whenever it changes
    effect(() => {
      const currentUser = this.authService.currentUser();
      const isAuthenticated = this.authService.isAuthenticated();
      const userId = this.authService.getCurrentUserId();
    });

    // Method 2: Log auth data immediately on component initialization
    this.logUserData();
  }

  logUserData(): void {

    // Access computed signals directly
    const authState = this.authService.authState();
    const currentUser = this.authService.currentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.token();
    const userId = this.authService.getCurrentUserId();

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
