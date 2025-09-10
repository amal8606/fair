import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AddPoComponent } from '../../component/add-po/add-po.component';
import { PoModelComponent } from '../../component/po-model/po-model.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PoService } from '../../../../_core/http/api/po.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    PoModelComponent,
    AddPoComponent,
    MatPaginatorModule,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(
    private readonly poService: PoService // private readonly report: ReportsApiService
  ) {}
  public showModel = false;
  public showAddPo = false;
  public isLoading = true;
  public customers = [];
  public po: any;

  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('paginator') paginator!: MatPaginator;

  public purchaseOrders = new MatTableDataSource<Request>();

  public sortedData = new MatTableDataSource<Request>();

  displayedColumns: string[] = [
    'poNumber',
    'customerName',
    'orderDate',
    'modeOfShipment',
    'totalCost',
    'totalAmount',
    'description',
    'createdBy',
  ];

  ngOnInit() {
    if (!localStorage.getItem('isLoggedIn')) {
      window.location.href = '/login';
    } else {
      this.getActivePO();
      this.getCustomer();
    }
  }

  public getActivePO() {
    this.isLoading = true;
    this.poService.getActivePO().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.sortedData.data = response;
        this.purchaseOrders.data = response; // if needed
        this.sortedData.paginator = this.paginator; // Make sure this is set
      },
      error: (error: any) => {
        this.isLoading = false;
      },
    });
  }
  public getCustomer() {
    this.poService.getCustomer().subscribe({
      next: (response: any) => {
        this.customers = response;
      },
      error: (error: any) => {},
    });
  }

  //   sort table by header
  sortData(sort: Sort) {
    const data = this.purchaseOrders.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData.data = data;
      return;
    }
    this.sortedData.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'poNumber':
          return this.compare(a.poNumber, b.poNumber, isAsc);
        case 'customerName':
          return this.compare(a.customerName, b.customerName, isAsc);
        case 'orderDate':
          return this.compare(a.orderDate, b.orderDate, isAsc);
        case 'modeOfShipment':
          return this.compare(a.modeOfShipment, b.modeOfShipment, isAsc);
        case 'totalCost':
          return this.compare(a.totalCost, b.totalCost, isAsc);
        case 'totalAmount':
          return this.compare(a.totalAmount, b.totalAmount, isAsc);
        case 'description':
          return this.compare(a.description, b.description, isAsc);
        case 'createdBy':
          return this.compare(a.user.fullName, b.user.fullName, isAsc);
        default:
          return 0;
      }
    });
    this.sortedData.paginator = this.paginator;
  }
  public compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'string' && typeof b === 'string') {
      // Case-insensitive string comparison
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public openPOModel(po: any) {
    this.showModel = true;
    this.po = po;
  }

  public openAddPo() {
    this.showAddPo = true;
  }
  public closeAddPo() {
    this.showAddPo = false;
    this.getActivePO();
  }
  ngAfterViewInit() {
    this.sortedData.paginator = this.paginator;
  }
}
