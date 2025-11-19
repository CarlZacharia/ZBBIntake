import { Routes } from '@angular/router';
import { MainPublicComponent } from './main-public/main-public.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { MedicaidintakeComponent } from './private/elderlaw/medicaidintake/medicaidintake.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainPublicComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    canActivate: [guestGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
