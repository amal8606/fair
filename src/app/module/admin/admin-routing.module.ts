import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin.component';
import { create } from 'domain';
import { CreatePoComponent } from './pages/create-po/create-po.component';
import { HomeComponent } from './pages/home/home.component';
import { ImportPosComponent } from './pages/import-pos/import-pos.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'create-po',
        component: CreatePoComponent,
      },
      {
        path: 'import-pos',
        component: ImportPosComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
