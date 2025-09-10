import { Routes } from '@angular/router';
import { AdminComponent } from './module/admin/pages/admin.component';
import { authGuard } from './_core/guard/auth.guard';
import { CreatePoComponent } from './module/admin/pages/create-po/create-po.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./module/admin/admin.module').then((m) => m.AdminModule),
    // canActivate: [authGuard], // enable if you want auth
  },
  {
    path: '',
    loadChildren: () =>
      import('./module/login/login.module').then((m) => m.LoginModule),
  },
];
