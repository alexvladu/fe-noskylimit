import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { InboxComponent } from './components/inbox/inbox';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path: 'inbox', component: InboxComponent},
  { path: '', redirectTo: 'inbox', pathMatch: 'full' }, // redirecționare implicită
  { path: '**', redirectTo: 'inbox' } // fallback
];

