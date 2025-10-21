import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard that protects routes requiring authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isValidSession()) {
        return true;
    }

    // Store the attempted URL for redirect after login
    const returnUrl = state.url !== '/login' ? state.url : '/intakehub';

    // Redirect to login page
    router.navigate(['/login'], {
        queryParams: { returnUrl }
    });

    return false;
};

/**
 * Guard that redirects authenticated users away from login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isValidSession()) {
        // Redirect authenticated users to intake hub
        router.navigate(['/intakehub']);
        return false;
    }

    return true;
};

/**
 * Guard that requires email verification
 */
export const emailVerifiedGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    if (!user?.email_verified) {
        router.navigate(['/verify-email'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    return true;
};

/**
 * Guard that checks for specific permissions
 */
export const permissionGuard: (permission: string) => CanActivateFn = (permission: string) => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            router.navigate(['/login'], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        if (!authService.hasPermission(permission)) {
            router.navigate(['/unauthorized']);
            return false;
        }

        return true;
    };
};

/**
 * Guard that checks if user profile is completed
 */
export const profileCompleteGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    if (!user?.profile_completed) {
        router.navigate(['/complete-profile'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    return true;
};
