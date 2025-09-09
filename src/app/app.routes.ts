import { Routes } from '@angular/router';
import { AdminComponent } from './module/admin/pages/admin.component';
import { authGuard } from './_core/guard/auth.guard';
import { CreatePoComponent } from './module/admin/pages/create-po/create-po.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./module/admin/pages/admin.component').then(
        (c) => c.AdminComponent
      ),
    canActivate: [authGuard],
  },
  { path: 'create-po', component: CreatePoComponent },
  {
    path: 'login',
    loadChildren: () =>
      import('./module/login/login.module').then((m) => m.LoginModule),
  },
];
