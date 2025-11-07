import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { HomeComponent } from './components/home/home';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

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
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        // canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '/login'
  }
];

