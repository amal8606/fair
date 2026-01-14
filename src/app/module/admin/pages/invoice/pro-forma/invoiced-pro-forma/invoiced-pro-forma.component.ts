import { Component } from '@angular/core';
import { InvoiceService } from '../../../../../../_core/http/api/invoice.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { ViewProFormaInvoiceComponent } from './component/view-pro-forma-invoice/view-pro-forma-invoice.component';

@Component({
  selector: 'app-invoiced-pro-forma',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginator,
    ViewProFormaInvoiceComponent,
  ],
  templateUrl: './invoiced-pro-forma.component.html',
})
export class InvoicedProFormaComponent {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly toastrService: ToastrService,
    private readonly orgainizationService: OrgainizationService
  ) {}

  public endDate = new Date();
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  public startDate = new Date(this.endDate);
  public defaultStartDate = this.startDate.setDate(this.endDate.getDate() - 7);
  proFormaForm: FormGroup = new FormGroup({
    startDate: new FormControl(
      this.formatDate(this.startDate),
      Validators.required
    ),
    endDate: new FormControl(
      this.formatDate(this.endDate),
      Validators.required
    ),
  });
  public orgList: any;
  public invoices = new MatTableDataSource<any>();
  public sortedData = new MatTableDataSource<any>();
  public isLoading: boolean = false;
  public matHeaders: string[] = [
    'proformaNumber',
    'customerId',
    'freightType',
    'createdAt',
    'estimatedShipDate',
    'totalAmount',
    'status',
  ];
  ngOnInit(): void {
    this.orgainizationService.getOrganization().subscribe({
      next: (orgs: any) => {
        this.orgList = orgs;
      },
    });
  }

  getInoicedProForma() {
    const { startDate, endDate } = this.proFormaForm.value;
    this.isLoading = true;
    this.invoiceService.getProFormaInvoiceData(startDate, endDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.invoices.data = res;
        this.sortedData.data = res;
        this.toastrService.success('Invoiced Pro Forma fetched successfully');
      },
      error: (err) => {},
    });
  }

  //   sort table headers
  sortData(sort: Sort) {
    const data = this.invoices.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData.data = data;
      return;
    }

    this.sortedData.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'proformaNumber':
          return this.compare(a.proformaNumber, b.proformaNumber, isAsc);
        case 'customerId':
          return this.compare(a.customerId, b.customerId, isAsc);
        case 'freightType':
          return this.compare(a.freightType, b.freightType, isAsc);

        case 'createdAt':
          return this.compare(a.createdAt, b.createdAt, isAsc);

        case 'estimatedShipDate':
          return this.compare(a.estimatedShipDate, b.estimatedShipDate, isAsc);
        case 'totalAmount':
          return this.compare(a.totalAmount, b.totalAmount, isAsc);
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }
  public compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'string' && typeof b === 'string') {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  public getCustomerName(customerId: any) {
    const customer = this.orgList.find(
      (c: any) => c.organizationId == customerId
    );
    return customer?.name || '';
  }
  public viewModel: boolean = false;
  public proformaDetails: any;
  public openModel(element: any) {
    this.viewModel = true;
    this.proformaDetails = element;
  }
  public closeModel() {
    this.viewModel = false;
  }
}
