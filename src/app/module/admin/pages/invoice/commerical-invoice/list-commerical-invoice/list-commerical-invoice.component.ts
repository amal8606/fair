import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommercialInvoiceService } from '../../../../../../_core/http/api/commericalInvoice.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { ViewCommericalInvoiceComponent } from './component/view-commerical-invoice/view-commerical-invoice.component';

@Component({
  selector: 'app-list-commerical-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginator,
    ViewCommericalInvoiceComponent,
  ],
  templateUrl: './list-commerical-invoice.component.html',
})
export class ListCommericalInvoiceComponent {
  constructor(
    private readonly commercialInvoiceService: CommercialInvoiceService,
    private readonly orgainizationService: OrgainizationService
  ) {}
  public matHeaders: string[] = [
    'commercialInvoiceNumber',
    'customerId',
    'finalDestination',
    'totalAmount',
  ];

  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('paginator') paginator!: MatPaginator;
  public loadingReport: boolean = false;
  public ciReport = new MatTableDataSource<any>();
  public sortedData = new MatTableDataSource<any>();
  public orgList: any;
  // format date
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  public endDate = new Date();

  public startDate = new Date(this.endDate);
  public defaultStartDate = this.startDate.setDate(this.endDate.getDate() - 7);

  public CIReport = new FormGroup({
    startDate: new FormControl(
      this.formatDate(this.startDate),
      Validators.required
    ),
    endDate: new FormControl(
      this.formatDate(this.endDate),
      Validators.required
    ),
  });
  ciData: any;
  public showModel: boolean = false;
  ngOnInit(): void {
    this.orgainizationService.getOrganization().subscribe({
      next: (orgs: any) => {
        this.orgList = orgs;
      },
    });
  }
  public tablehead: any;
  public getCustomerName(customerId: any) {
    const customer = this.orgList.find(
      (c: any) => c.organizationId == customerId
    );
    return customer?.name || '';
  }

  public getCIReport(): void {
    this.sortedData.data = [];
    this.loadingReport = true;
    const { startDate, endDate } = this.CIReport.value;

    this.tablehead = this.matHeaders;
    this.commercialInvoiceService
      .getCommercialInvoicedPO(startDate, endDate)
      .subscribe({
        next: (result: any) => {
          console.log(result);
          const data = result;
          this.sortedData.data = data;
          this.ciReport.data = data;
          this.sortedData.paginator = this.paginator;
        },
        error: () => {
          this.loadingReport = false;
        },
        complete: () => {
          this.loadingReport = false;
        },
      });
  }

  public openViewCIModel(ciNumber: number) {
    this.ciNumber = ciNumber;
    this.showModel = !this.showModel;
  }

  //   sort table headers
  sortData(sort: Sort) {
    const data = this.ciReport.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData.data = data;
      return;
    }

    this.sortedData.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'commercialInvoiceNumber':
          return this.compare(
            a.commercialInvoiceNumber,
            b.commercialInvoiceNumber,
            isAsc
          );
        case 'customerId':
          return this.compare(a.customerId, b.customerId, isAsc);
        case 'finalDestination':
          return this.compare(a.finalDestination, b.finalDestination, isAsc);
        case 'totalAmount':
          return this.compare(a.totalAmount, b.totalAmount, isAsc);
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

  public options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    useBom: true,
    noDownload: false,
    headers: [
      'orgName',
      'userName',
      'totalHours',
      'totalProductionHours',
      'totalQcHours',
      'totalMiscHours',
      'totalQc',
      'totalQcBypass',
      'totalRequestsNoRejects',
      'totalQcFailure',
      'totalQcFailureRate',
      'espcRejectRate',
      'subRejectRate',
      'totalAtomPoints',
      'totalRevenue',
      'totalCost',
      'totalEarnings',
      'totalRevenuePerHour',
      'totalCostPerHour',
      'productionRevenuePerHour',
      'productionCostPerHour',
      'totalQcCostPerHour',
      'qcLeadQcCount',
      'qcLeadQcBypassCount',
      'qcLeadTotalReject',
      'qcLeadRequestsWithNoRejects',
      'qcLeadRequestsWithRejects',
    ],
    useHeader: true,
    nullToEmptyString: true,
  };
}
