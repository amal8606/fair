import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AddPoComponent } from '../../component/add-po/add-po.component';
import { PoModelComponent } from '../../component/po-model/po-model.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PoService } from '../../../../_core/http/api/po.service';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    MatTabsModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
  constructor(
    private readonly poService: PoService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly toaster: ToastrService,
  ) {}

  public showModel = false;
  public showAddPo = false;
  public isLoading = true;
  public customers: any[] = [];
  public po: any;
  public editingIndex: number | null = null;
  @ViewChild(MatSort) empTbSort!: MatSort;
  @ViewChild('paginator') paginator!: MatPaginator;

  public purchaseOrders = new MatTableDataSource<any>();
  public purchaseOrdersIncoming = new MatTableDataSource<any>();
  public purchaseOrdersOutgoing = new MatTableDataSource<any>();
  public purchaseOrdersDummy = new MatTableDataSource<any>();

  public sortedData = new MatTableDataSource<any>();

  public activeDisplayedColumns: string[] = [];

  private incomingColumns: string[] = [
    'poNumber',
    'poStatus',
    'customerName',
    'supplier',
    'destination',
    'orderDate',
    'deliverySchedule',
    'paymentTerms',
    'deliveryTerms',
    'modeOfShipment',
    'shippingCharges',
    'discount',
    'totalCost',
    'totalAmount',
    'createdBy',
    'actions',
  ];

  private outgoingColumns: string[] = [
    'poNumber',
    'poStatus',
    'customerName',
    'supplier',
    'destination',
    'orderDate',
    'deliverySchedule',
    'paymentTerms',
    'deliveryTerms',
    'modeOfShipment',
    'shippingCharges',
    'discount',
    'totalCost',
    'totalAmount',
    'createdBy',
    'actions',
  ];

  private dummyColumns: string[] = [
    'poNumber',
    'poStatus',
    'customerName',
    'supplier',
    'destination',
    'orderDate',
    'deliverySchedule',
    'paymentTerms',
    'deliveryTerms',
    'modeOfShipment',
    'shippingCharges',
    'discount',
    'totalCost',
    'totalAmount',
    'createdBy',
    'actions',
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '/login';
      } else {
        this.getActivePO();
        this.getCustomer();
      }
    }
  }

  ngAfterViewInit() {
    this.sortedData.paginator = this.paginator;
  }

  public getActivePO() {
    this.isLoading = true;
    this.poService.getActivePO().subscribe({
      next: (response: any[]) => {
        this.isLoading = false;
        const incomingPOs: any[] = [];
        const outgoingPOs: any[] = [];
        const dummyPOs: any[] = [];
        response.forEach((po: any) => {
          if (po.poType === 'Incoming') {
            incomingPOs.push(po);
          } else if (po.poType === 'Outgoing') {
            outgoingPOs.push(po);
          } else {
            dummyPOs.push(po);
          }
        });

        this.purchaseOrdersIncoming.data = incomingPOs;
        this.purchaseOrdersOutgoing.data = outgoingPOs;
        this.purchaseOrdersDummy.data = dummyPOs;
        this.purchaseOrders.data = response;

        this.onTabChange(0);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toaster.error('Error fetching Purchase Orders');
      },
    });
  }

  public onTabChange(tabIndex: number): void {
    let activeData: any[] = [];

    if (tabIndex === 0) {
      activeData = this.purchaseOrdersIncoming.data;
      this.activeDisplayedColumns = this.incomingColumns; // Set columns for INCOMING
    } else if (tabIndex === 1) {
      activeData = this.purchaseOrdersOutgoing.data;
      this.activeDisplayedColumns = this.outgoingColumns; // Set columns for OUTGOING
    } else {
      activeData = this.purchaseOrdersDummy.data;
      this.activeDisplayedColumns = this.dummyColumns; // Set columns for DUMMY
    }

    this.sortedData.data = activeData;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    if (this.empTbSort && this.empTbSort.active) {
      const sortState: Sort = {
        active: this.empTbSort.active,
        direction: this.empTbSort.direction,
      };

      this.empTbSort.sortChange.emit(sortState);
    }
  }

  public getCustomer() {
    this.poService.getCustomer().subscribe({
      next: (response: any) => {
        this.customers = response;
      },
      error: (error: any) => {
        this.toaster.error('Error fetching customers');
      },
    });
  }

  sortData(sort: Sort) {
    const data = this.sortedData.data.slice();
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
          return this.compare(a.buyerOrgName, b.buyerOrgName, isAsc);
        case 'supplier':
          return this.compare(
            a.supplier || a.vendorOrgName,
            b.supplier || b.vendorOrgName,
            isAsc,
          );
        case 'destination':
          return this.compare(a.destination, b.destination, isAsc);
        case 'orderDate':
          return this.compare(a.orderDate, b.orderDate, isAsc);
        case 'deliverySchedule':
          return this.compare(a.deliverySchedule, b.deliverySchedule, isAsc);
        case 'paymentTerms':
          return this.compare(a.paymentTerms, b.paymentTerms, isAsc);
        case 'deliveryTerms':
          return this.compare(a.deliveryTerms, b.deliveryTerms, isAsc);
        case 'modeOfShipment':
          return this.compare(a.modeOfShipment, b.modeOfShipment, isAsc);
        case 'shippingCharges':
          return this.compare(a.shippingCharges, b.shippingCharges, isAsc);
        case 'discount':
          return this.compare(a.discount, b.discount, isAsc);
        case 'totalCost':
          return this.compare(a.totalCost, b.totalCost, isAsc);
        case 'totalAmount':
          return this.compare(a.totalAmount, b.totalAmount, isAsc);
        case 'poStatus':
          return this.compare(a.poStatus, b.poStatus, isAsc);
        case 'createdBy':
          return this.compare(a.createdBy, b.createdBy, isAsc);
        default:
          return 0;
      }
    });
  }

  public compare(
    a: number | string | null,
    b: number | string | null,
    isAsc: boolean,
  ) {
    const valA = a ?? '';
    const valB = b ?? '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return (
        (valA.toLowerCase() < valB.toLowerCase() ? -1 : 1) * (isAsc ? 1 : -1)
      );
    }
    return (valA < valB ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public openPOModel(po: any) {
    this.showModel = true;
    this.po = po;
  }

  public openAddPo() {
    this.router.navigate(['/admin/create-po']);
  }
  public closeAddPo() {
    this.showAddPo = false;
    this.getActivePO();
  }
  public closePoModel(event: boolean) {
    if (event == true) {
      this.getActivePO();
      this.showModel = false;
    } else {
      this.showModel = false;
    }
  }
  isediting: boolean = false;
  saveItem(item: any) {
    this.isediting = true;
    this.poService.updatePOItem(item).subscribe({
      next: () => {
        this.isediting = false;
        this.toaster.success('PO details updated successfully', 'Success');
        this.getActivePO();
      },
      error: () => {
        this.isediting = false;
        this.toaster.error('Failed to update PO details', 'Error');
        // Optionally show an error message
      },
    });
  }
  cancelEdit() {
    this.editingIndex = null;
  }
  editItem(index: number) {
    this.editingIndex = index;
  }
}
