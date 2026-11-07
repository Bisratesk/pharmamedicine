import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { SearchPage } from './features/search/search-page/search-page';
import { roleGuard } from './core/guards/role-guard';
import { Register } from './features/auth/register/register';
import { OwnerDashboard } from './features/pharmacy/owner-dashboard/owner-dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'admin', component: AdminDashboard, canActivate: [roleGuard(['Admin'])] },
  { path: 'search', component: SearchPage, canActivate: [roleGuard(['Customer', 'PharmacyOwner', 'Admin'])] },
  { path: 'owner', component: OwnerDashboard, canActivate: [roleGuard(['PharmacyOwner'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
  
];