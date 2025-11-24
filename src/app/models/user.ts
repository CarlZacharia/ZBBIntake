export interface IUser {
  user_id: number;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  phone?: string;
  date_created: string;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  preferred_contact_method?: 'email' | 'phone' | 'text';
  profile_completed: boolean;
}

export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  phone?: string;
  preferred_contact_method?: 'email' | 'phone' | 'text';
  terms_accepted: boolean;
  privacy_accepted: boolean;
  user_category?: string;

}

export interface IPasswordReset {
  email: string;
}

export interface IPasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface IChangePassword {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: IUser;
  token?: string;
  refresh_token?: string;
  expires_in?: number;
}

// Error types for better error handling
export interface IAuthError {
  code: string;
  message: string;
  field?: string;
}

