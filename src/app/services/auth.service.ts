import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  IUser,
  IAuthState,
  ILoginCredentials,
  IRegisterData,
  IAuthResponse,
  IPasswordReset,
  IPasswordResetConfirm,
  IChangePassword,
  IAuthError
} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://zbplans.com/api/auth'; // Remote PHP backend URL
  private readonly TOKEN_KEY = 'zbb_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'zbb_refresh_token';
  private readonly USER_KEY = 'zbb_user';

  // Primary authentication state signal
  private _authState = signal<IAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    refreshToken: null,
    tokenExpiration: null
  });

  // Computed signals for reactive state access
  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly currentUser = computed(() => this._authState().user);
  readonly isLoading = computed(() => this._authState().isLoading);
  readonly token = computed(() => this._authState().token);

  // Token refresh timer
  private refreshTimer?: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize authentication state from localStorage
    this.initializeAuthState();

    // Set up automatic token refresh
    effect(() => {
      const state = this._authState();
      if (state.isAuthenticated && state.tokenExpiration) {
        this.scheduleTokenRefresh(state.tokenExpiration);
      }
    });
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuthState(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);

      if (token && userStr) {
        const user: IUser = JSON.parse(userStr);
        const tokenExpiration = this.getTokenExpiration(token);

        // Check if token is still valid
        if (tokenExpiration && tokenExpiration > Date.now()) {
          this._authState.update(state => ({
            ...state,
            user,
            isAuthenticated: true,
            token,
            refreshToken,
            tokenExpiration
          }));
        } else {
          // Token expired, attempt refresh if refresh token exists
          if (refreshToken) {
            this.refreshAuthToken().subscribe({
              error: () => this.logout()
            });
          } else {
            this.logout();
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      this.clearAuthData();
    }
  }

  /**
   * User login
   */
  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    this._authState.update(state => ({ ...state, isLoading: true }));

    return this.http.post<any>(`${this.API_URL}/login.php`, credentials).pipe(
      map(response => {
        // Convert PHP response format to expected format
        return {
          success: response.success,
          message: response.message,
          user: response.data?.user,
          token: response.data?.token,
          expires_in: response.data?.expires_in
        } as IAuthResponse;
      }),
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, undefined, response.expires_in);
        }
      }),
      catchError(this.handleAuthError.bind(this)),
      tap(() => this._authState.update(state => ({ ...state, isLoading: false })))
    );
  }

  /**
   * User registration
   */
  register(registerData: IRegisterData): Observable<IAuthResponse> {
    this._authState.update(state => ({ ...state, isLoading: true }));

    // Map Angular field names to PHP field names
    const phpData = {
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      firstName: registerData.first_name,
      middleName: registerData.middle_name,
      lastName: registerData.last_name,
      suffix: registerData.suffix,
      phone: registerData.phone,
      preferredContactMethod: registerData.preferred_contact_method
    };

    return this.http.post<any>(`${this.API_URL}/register.php`, phpData).pipe(
      map(response => {
        // Convert PHP response format to expected format
        return {
          success: response.success,
          message: response.message,
          user: response.data?.user,
          token: response.data?.token,
          expires_in: response.data?.expires_in
        } as IAuthResponse;
      }),
      tap(response => {
        if (response.success && response.user && response.token) {
          this.setAuthData(response.user, response.token, undefined, response.expires_in);
        }
      }),
      catchError(this.handleAuthError.bind(this)),
      tap(() => this._authState.update(state => ({ ...state, isLoading: false })))
    );
  }

  /**
   * User logout
   */
  logout(): void {
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    // Call logout endpoint if token exists
    const token = this._authState().token;
    if (token) {
      this.http.post(`${this.API_URL}/logout.php`, {}).subscribe({
        error: (error) => console.warn('Logout API call failed:', error)
      });
    }

    // Clear local auth data
    this.clearAuthData();

    // Reset auth state
    this._authState.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      refreshToken: null,
      tokenExpiration: null
    });

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshAuthToken(): Observable<IAuthResponse> {
    // For this PHP implementation, we'll just return an error
    // since refresh tokens are not implemented
    return throwError(() => new Error('Token refresh not implemented in PHP backend'));
  }

  /**
   * Password reset request
   */
  requestPasswordReset(data: IPasswordReset): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/password-reset`, data).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Confirm password reset
   */
  confirmPasswordReset(data: IPasswordResetConfirm): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/password-reset/confirm`, data).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Change password for authenticated user
   */
  changePassword(data: IChangePassword): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/change-password`, data).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<IUser>): Observable<IAuthResponse> {
    return this.http.patch<IAuthResponse>(`${this.API_URL}/profile`, updates).pipe(
      tap(response => {
        if (response.success && response.user) {
          this._authState.update(state => ({
            ...state,
            user: response.user!
          }));
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Verify email address
   */
  verifyEmail(token: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/verify-email`, { token }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this._authState.update(state => ({
            ...state,
            user: response.user!
          }));
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Resend email verification
   */
  resendEmailVerification(): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/verify-email/resend`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Check if user has permission for specific action
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user || !this.isAuthenticated()) {
      return false;
    }

    // Implement your permission logic here
    // For now, all authenticated users have all permissions
    return true;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    return this.currentUser()?.user_id || null;
  }

  /**
   * Check if user is authenticated and token is valid
   */
  isValidSession(): boolean {
    const state = this._authState();
    if (!state.isAuthenticated || !state.token || !state.tokenExpiration) {
      return false;
    }

    // Check if token expires in next 5 minutes
    return state.tokenExpiration > (Date.now() + 5 * 60 * 1000);
  }

  // Private helper methods

  /**
   * Set authentication data in state and localStorage
   */
  private setAuthData(
    user: IUser,
    token: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    const tokenExpiration = expiresIn ? Date.now() + (expiresIn * 1000) : this.getTokenExpiration(token);

    this._authState.update(state => ({
      ...state,
      user,
      isAuthenticated: true,
      token,
      refreshToken: refreshToken || state.refreshToken,
      tokenExpiration
    }));

    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log(user, this)
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Extract token expiration from JWT token
   */
  private getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(tokenExpiration: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiration
    const refreshTime = tokenExpiration - Date.now() - (5 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        if (this.isAuthenticated()) {
          this.refreshAuthToken().subscribe({
            error: () => this.logout()
          });
        }
      }, refreshTime);
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let authError: IAuthError;

    console.error('HTTP Error:', error); // Debug logging

    if (error.error && typeof error.error === 'object') {
      authError = {
        code: error.error.code || 'UNKNOWN_ERROR',
        message: error.error.message || 'An unknown error occurred',
        field: error.error.field
      };

      // Include validation errors if available
      if (error.error.errors && Array.isArray(error.error.errors)) {
        authError.message = error.error.errors.join(', ');
      }
    } else {
      // Better error messages for common network issues
      if (error.status === 0) {
        authError = {
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to server. Please check if the PHP server is running and accessible.'
        };
      } else {
        authError = {
          code: 'NETWORK_ERROR',
          message: `Server error (${error.status}): ${error.message || 'Unable to connect to the server'}`
        };
      }
    }

    // Handle specific error cases
    if (error.status === 401) {
      authError.code = 'UNAUTHORIZED';
      authError.message = 'Invalid credentials or session expired';
      // Don't auto-logout on login failures, only on token validation failures
      if (this.isAuthenticated()) {
        this.logout();
      }
    } else if (error.status === 403) {
      authError.code = 'FORBIDDEN';
      authError.message = 'You do not have permission to perform this action';
    } else if (error.status === 429) {
      authError.code = 'RATE_LIMITED';
      authError.message = 'Too many requests. Please try again later.';
    }

    console.error('Authentication error:', authError);
    return throwError(() => authError);
  }
}
