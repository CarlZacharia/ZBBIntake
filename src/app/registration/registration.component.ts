import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IRegisterData, IAuthError } from '../models/user';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  // Form data signal
  registerData = signal<IRegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    phone: '',
    preferred_contact_method: 'email',
    terms_accepted: false,
    privacy_accepted: false
  });

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Handle form submission
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return;
    }

    // Validate passwords match
    if (this.registerData().password !== this.registerData().confirmPassword) {
      this.fieldErrors.update(errors => ({
        ...errors,
        ['confirmPassword']: 'Passwords do not match'
      }));
      return;
    }

    // Validate terms acceptance
    if (!this.registerData().terms_accepted || !this.registerData().privacy_accepted) {
      this.error.set('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.fieldErrors.set({});

    this.authService.register(this.registerData()).subscribe({
      next: (response) => {
        if (response.success) {
          // Successful registration - redirect to intake hub
          this.router.navigate(['/intakehub']);
        } else {
          this.error.set(response.message || 'Registration failed. Please try again.');
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
  updateField(field: keyof IRegisterData, value: any): void {
    this.registerData.update(data => ({
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

    // Clear confirm password error when password changes
    if (field === 'password' && this.fieldErrors()['confirmPassword']) {
      this.fieldErrors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors['confirmPassword'];
        return newErrors;
      });
    }
  }

  /**
   * Handle input events with proper typing
   */
  onInputChange(field: keyof IRegisterData, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateField(field, target.value);
  }

  /**
   * Handle select events with proper typing
   */
  onSelectChange(field: keyof IRegisterData, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateField(field, target.value);
  }

  /**
   * Handle checkbox events with proper typing
   */
  onCheckboxChange(field: keyof IRegisterData, event: Event): void {
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
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(current => !current);
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(current => !current);
  }

  /**
   * Check if passwords match
   */
  passwordsMatch(): boolean {
    const data = this.registerData();
    return data.password === data.confirmPassword;
  }

  /**
   * Check password strength
   */
  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.registerData().password;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
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
