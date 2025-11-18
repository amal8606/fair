import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin.component';
import { create } from 'domain';
import { CreatePoComponent } from './pages/create-po/create-po.component';
import { HomeComponent } from './pages/home/home.component';
import { ImportPosComponent } from './pages/import-pos/import-pos.component';
import { OrganizationComponent } from './pages/organization/organization.component';
import { ProFormaInvoiceComponent } from './pages/invoice/pro-forma/pro-forma-invoice/pro-forma-invoice.component';
import { InvoicedProFormaComponent } from './pages/invoice/pro-forma/invoiced-pro-forma/invoiced-pro-forma.component';
import { CreateCommericalInvoiceComponent } from './pages/invoice/commerical-invoice/create-commerical-invoice/create-commerical-invoice.component';
import { ListCommericalInvoiceComponent } from './pages/invoice/commerical-invoice/list-commerical-invoice/list-commerical-invoice.component';

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
      },
      {
        path: 'organization',
        component: OrganizationComponent,
      },
      {
        path: 'pro-forma-invoice',
        component: ProFormaInvoiceComponent,
      },
      {
        path: 'pro-forma-invoiced-list',
        component: InvoicedProFormaComponent,
      },
      {
        path: 'create-commerical-invoice',
        component: CreateCommericalInvoiceComponent,
      },
      {
        path: 'list-commerical-invoice',
        component: ListCommericalInvoiceComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
