import { Routes } from '@angular/router';
import { AdminComponent } from './module/admin/pages/admin.component';
import { authGuard } from './_core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./module/admin/pages/admin.component').then(c => c.AdminComponent),
    canActivate: [authGuard],
  },
  {path: 'login',
  loadChildren: () => import('./module/login/login.module').then(m => m.LoginModule)}
];
