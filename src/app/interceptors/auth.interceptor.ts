import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip interceptor for auth endpoints to avoid circular calls
  if (req.url.includes('/auth/') && (
    req.url.includes('login.php') ||
    req.url.includes('register.php') ||
    req.url.includes('logout.php')
  )) {
    return next(req);
  }

  // Get current token
  const token = authService.token();

  if (!token) {
    return next(req);
  }

  // Clone request and add authorization header
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq).pipe(
    catchError(error => {
      // Handle 401 errors by logging out user (no refresh token in PHP backend)
      if (error.status === 401 && authService.isAuthenticated()) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
