import { Routes } from '@angular/router';
import { MainPublicComponent } from './main-public/main-public.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { IntakehubComponent } from './private/intakehub/intakehub.component';
import { MainintakeComponent } from './private/mainintake/mainintake.component';
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
    path: 'intakehub',
    component: IntakehubComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mainintake',
    component: MainintakeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'medicaidintake',
    component: MedicaidintakeComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
