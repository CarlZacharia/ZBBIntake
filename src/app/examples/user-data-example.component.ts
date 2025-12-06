import { Component, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-user-data-example',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="user-data-example">
      <h3>User Data Access Example</h3>

      <div *ngIf="isAuthenticated(); else notAuthenticated">
        <h4>User Information:</h4>
        <p><strong>Name:</strong> {{ userName() }}</p>
        <p><strong>Email:</strong> {{ userEmail() }}</p>
        <p><strong>User ID:</strong> {{ userId() }}</p>
        <p><strong>Phone:</strong> {{ userPhone() || 'Not provided' }}</p>

        <button (click)="logAllUserData()" class="btn">Log All User Data</button>
        <button (click)="checkPermissions()" class="btn">Check Permissions</button>
      </div>

      <ng-template #notAuthenticated>
        <p>User is not authenticated</p>
      </ng-template>
    </div>
  `,
    styles: [`
    .user-data-example {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 20px 0;
    }

    .btn {
      background: #00008B;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin-right: 10px;
      cursor: pointer;
    }

    .btn:hover {
      background: #0056b3;
    }
  `]
})
export class UserDataExampleComponent implements OnInit {

    // Create computed signals for reactive data access
    readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
    readonly currentUser = computed(() => this.authService.currentUser());
    readonly userName = computed(() => {
        const user = this.currentUser();
        return user ? `${user.first_name} ${user.last_name}` : '';
    });
    readonly userEmail = computed(() => this.currentUser()?.email || '');
    readonly userId = computed(() => this.currentUser()?.user_id || null);
    readonly userPhone = computed(() => this.currentUser()?.phone);

    constructor(private authService: AuthService) {
        // Method 1: Using effect to react to auth state changes
        effect(() => {
            const user = this.currentUser();
            const isAuth = this.isAuthenticated();

            console.log('🔄 Auth state changed:');
            console.log('  Authenticated:', isAuth);
            if (user) {
                console.log('  User:', `${user.first_name} ${user.last_name} (${user.email})`);
            }
        });
    }

    ngOnInit(): void {
        // Method 2: Access data on component initialization
        this.logUserDataOnInit();
    }

    private logUserDataOnInit(): void {
        console.log('🚀 Component initialized - accessing user data:');

        // Direct access to computed signals
        console.log('Is Authenticated:', this.authService.isAuthenticated());
        console.log('Current User:', this.authService.currentUser());
        console.log('User ID via service method:', this.authService.getCurrentUserId());

        // Access full auth state
        const authState = this.authService.authState();
        console.log('Full Auth State:', authState);
    }

    logAllUserData(): void {
        console.log('📊 === Complete User Data Access Example ===');

        // Method 1: Using the service's computed signals
        const user = this.authService.currentUser();
        const isAuth = this.authService.isAuthenticated();
        const token = this.authService.token();
        const authState = this.authService.authState();

        console.log('🔐 Authentication Status:', isAuth);
        console.log('🏷️ Token (preview):', token?.substring(0, 20) + '...');
        console.log('👤 User Object:', user);

        if (user) {
            console.log('📝 User Details:');
            console.log('  🆔 ID:', user.user_id);
            console.log('  👤 Name:', `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`.trim());
            console.log('  📧 Email:', user.email);
            console.log('  📱 Phone:', user.phone || 'Not provided');
            console.log('  📞 Preferred Contact:', user.preferred_contact_method || 'Not set');
            console.log('  📅 Date Created:', user.date_created);
            console.log('  🕐 Last Login:', user.last_login || 'Never');
            console.log('  ✅ Email Verified:', user.email_verified);
            console.log('  📋 Profile Completed:', user.profile_completed);
            console.log('  🟢 Active:', user.is_active);
        }

        // Method 2: Using component's computed signals
        console.log('🔧 Via Component Computed Signals:');
        console.log('  Name:', this.userName());
        console.log('  Email:', this.userEmail());
        console.log('  User ID:', this.userId());

        console.log('🌐 Full Auth State:', authState);
        console.log('===============================================');
    }

    checkPermissions(): void {
        console.log('🔒 === Permission Check Example ===');

        const userId = this.authService.getCurrentUserId();
        const hasPermission = this.authService.hasPermission('read_data');
        const isValidSession = this.authService.isValidSession();

        console.log('User ID:', userId);
        console.log('Has read_data permission:', hasPermission);
        console.log('Valid session:', isValidSession);
        console.log('==================================');
    }
}
