import { Routes } from '@angular/router';
import { MainPublicComponent } from './main-public/main-public.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { IntakehubComponent } from './private/intakehub/intakehub.component';

export const routes: Routes = [
  { path: '', component: MainPublicComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'intakehub', component: IntakehubComponent }
];
