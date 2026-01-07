import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { InboxComponent } from './components/inbox/inbox';
import { HomeComponent } from './components/home/home';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { GuestGuard } from './guards/guest.guard';
import { RegisterComponent } from './components/register/register';
import { SetupProfile } from './components/setup-profile/setup-profile';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile';
import { LikesComponent } from './components/likes/likes';

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
    path: 'setup-profile',
    component: SetupProfile
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'inbox',
        component: InboxComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'likes',
        component: LikesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
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

