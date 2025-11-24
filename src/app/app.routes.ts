import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { InboxComponent } from './components/inbox/inbox';
import { HomeComponent } from './components/home/home';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { GuestGuard } from './guards/guest.guard';
import { RegisterComponent } from './components/register/register';
import { AdminComponent } from './components/admin/admin';

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
    path: 'inbox',
    component: InboxComponent,
    // canActivate: [SomeGuard]
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
        path: 'admin',
        component: AdminComponent,
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

