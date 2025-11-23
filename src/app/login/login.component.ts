import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ILoginCredentials, IAuthError } from '../models/user';
import { DataService } from '../services/data.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Form data signal
  loginData = signal<ILoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  private returnUrl: string = '/intakehub';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public dataService: DataService
  ) {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/intakehub';
  }

  /**
   * Handle form submission
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.fieldErrors.set({});

    this.authService.login(this.loginData()).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Set portal_user_id for DataService
          if (response.user && response.user.user_id) {
            this.dataService.pui = response.user.user_id;
            // Load all client data for this user
            this.dataService.loadClientData().subscribe({
              next: (clientData) => {
                if (clientData) {
                  this.dataService.setClientData(clientData);
                }
              },
              error: (err) => {
                console.warn('Failed to load client data after login:', err);
              }
            });
          }
          // Successful login - redirect to return URL
          this.router.navigate([this.returnUrl]);
        } else {
          this.error.set(response.message || 'Login failed. Please try again.');
        }
      },
      error: (authError: IAuthError) => {
        this.isLoading.set(false);

        if (authError.field) {
          // Field-specific error
          this.fieldErrors.update(errors => ({
            ...errors,
            [authError.field!]: authError.message
          }));
        } else {
          // General error
          this.error.set(authError.message);
        }
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Update form data
   */
  updateField(field: keyof ILoginCredentials, value: any): void {
    this.loginData.update(data => ({
      ...data,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (this.fieldErrors()[field]) {
      this.fieldErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  /**
   * Handle input events with proper typing
   */
  onInputChange(field: keyof ILoginCredentials, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateField(field, target.value);
  }

  /**
   * Handle checkbox events with proper typing
   */
  onCheckboxChange(field: keyof ILoginCredentials, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateField(field, target.checked);
  }

  /**
   * Get field error message
   */
  getFieldError(field: string): string | null {
    return this.fieldErrors()[field] || null;
  }

  /**
   * Check if field has error
   */
  hasFieldError(field: string): boolean {
    return !!this.fieldErrors()[field];
  }

  /**
   * Handle forgot password
   */
  onForgotPassword(): void {
    const email = this.loginData().email;
    if (email) {
      this.router.navigate(['/forgot-password'], {
        queryParams: { email }
      });
    } else {
      this.router.navigate(['/forgot-password']);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.error.set(null);
    this.fieldErrors.set({});
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }
}
