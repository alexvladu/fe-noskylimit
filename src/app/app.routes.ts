import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  { 
    path: '**', 
    redirectTo: '/login'
  }
];

