import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip interceptor for auth endpoints to avoid circular calls
    if (req.url.includes('/auth/') && (
        req.url.includes('/login') ||
        req.url.includes('/register') ||
        req.url.includes('/refresh') ||
        req.url.includes('/password-reset')
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
            // Handle 401 errors by attempting token refresh
            if (error.status === 401 && authService.isAuthenticated()) {
                return authService.refreshAuthToken().pipe(
                    switchMap(() => {
                        // Retry original request with new token
                        const newToken = authService.token();
                        const retryReq = req.clone({
                            headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                        });
                        return next(retryReq);
                    }),
                    catchError(refreshError => {
                        // If refresh fails, logout user
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
