import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PoService } from '../../../../_core/http/api/po.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { A11yModule } from '@angular/cdk/a11y';
@Component({
  selector: 'app-create-po',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    A11yModule,
  ],
  templateUrl: './create-po.component.html',
})
export class CreatePoComponent {
  constructor(
    private readonly poService: PoService // private readonly report: ReportsApiService
  ) {}
  @ViewChild('empTbSort') empTbSort = new MatSort();

  public purchaseOrdersList = new MatTableDataSource<Request>();
  public selecterPOList = new MatTableDataSource<Request>();

  public sortedData1 = new MatTableDataSource<Request>();
  public sortedData2 = new MatTableDataSource<Request>();

  // For the first table
  displayedColumnsFirst: string[] = [
    'select',
    'itemId',
    'poId',
    'lineNumber',
    'manufacturerModel',
    'partNumber',
    'quantity',
    'actualCostPerUnit',
    'unitPrice',
    'totalPrice',
    'description',
    'unit',
  ];

  // For the second table
  displayedColumnsSecond: string[] = [
    'poNumber',
    'customerName',
    'orderDate',
    'modeOfShipment',
    'totalCost',
    'totalAmount',
    'description',
    'createdBy',
    'actions',
  ];
  public formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  public date = new Date();
  public poForm: FormGroup = new FormGroup({
    customerId: new FormControl(null, Validators.required),
    poNumber: new FormControl('', Validators.required),
    poId: new FormControl(null),
    orderDate: new FormControl(this.formatDate(this.date), Validators.required),
    createdBy: new FormControl('1', Validators.required),
    modeOfShipment: new FormControl('', Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    totalCost: new FormControl(null, Validators.required),
    description: new FormControl('', Validators.required),
    active: new FormControl(1, Validators.required),
  });
  public customers: any = [];
  public showAddItem: boolean = false;
  public addNewItem: boolean = true;
  public addExisting: boolean = false;

  ngOnInit() {
    this.getActivePO();
    this.getCustomer();
  }
  public poList: any;
  public getActivePO() {
    this.poService.getActivePO().subscribe({
      next: (response: any) => {
        this.poList = response;
        console.log(response);
      },
      error: (error: any) => {},
    });
  }

  public productItems: any;
  public subTotal: any;
  public total: any;
  public loading = false;
  public getPO() {
    const poId = this.poForm.get('poId')?.value;
    this.poService.getPO(poId).subscribe({
      next: (response) => {
        this.productItems = response;
        this.sortedData1.data = response;
        this.purchaseOrdersList.data = response;
        // this.subTotal = this.productItems.reduce(
        //   (acc: number, item: any) => acc + item.totalPrice,
        //   0
        // );
        // this.total = this.subTotal;
        console.log(this.productItems);
      },
      error: (error) => {
        console.log(error);
        if (error.status === 404) {
          this.productItems = [];
        }
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

  selection = new SelectionModel<any>(true, []); // multiple = true
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.sortedData1.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.sortedData1.data.forEach((row) => this.selection.select(row));
  }
  sortData(sort: Sort) {
    const data = this.purchaseOrdersList.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData1.data = data;
      return;
    }
    this.sortedData1.data = data.sort((a: any, b: any) => {
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
  }
  public compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'string' && typeof b === 'string') {
      // Case-insensitive string comparison
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
