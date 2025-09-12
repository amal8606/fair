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
import { ToastrService } from 'ngx-toastr';

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
    private readonly poService: PoService,
    private readonly toaster: ToastrService
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
    poNumber: new FormControl('', Validators.required),
    supplier: new FormControl('', Validators.required),
    customerId: new FormControl(null, Validators.required),
    orderDate: new FormControl(this.formatDate(this.date), Validators.required),
    description: new FormControl('', Validators.required),
    destination: new FormControl('', Validators.required),
    paymentTerms: new FormControl('', Validators.required),
    deliveryTerms: new FormControl('', Validators.required),
    modeOfShipment: new FormControl('', Validators.required),
    shippingCharges: new FormControl(null, Validators.required),
    discount: new FormControl(null),
    totalAmount: new FormControl(null, Validators.required),
    totalCost: new FormControl(null, Validators.required),
    createdBy: new FormControl('1', Validators.required),
    active: new FormControl(1, Validators.required),
  });

  public poId: FormGroup = new FormGroup({
    poId: new FormControl('', Validators.required),
  });
  public newPoItem: FormGroup = new FormGroup({
    poId: new FormControl(''),
    actualCostPerUnit: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    itemId: new FormControl(0),
    manufacturerModel: new FormControl('', Validators.required),
    partNumber: new FormControl('', Validators.required),
    quantity: new FormControl('', Validators.required),
    totalPrice: new FormControl('', Validators.required),
    traceabilityRequired: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    unitPrice: new FormControl('', Validators.required),
  });

  public customers: any = [];
  public showAddItem: boolean = false;
  public addNewItem: boolean = true;
  public addExisting: boolean = false;
  public isLoading: boolean = false;

  ngOnInit() {
    this.getActivePO();
    this.getCustomer();
  }
  public poList: any;
  public getActivePO() {
    this.poService.getActivePO().subscribe({
      next: (response: any) => {
        this.poList = response;
      },
      error: (error: any) => {},
    });
  }

  public loading = false;

  public getPO() {
    this.sortedData1.data = [];
    this.purchaseOrdersList.data = [];
    this.loading = true;
    const poId = this.poId.get('poId')?.value;
    this.poService.getPO(poId).subscribe({
      next: (response) => {
        this.loading = false;
        this.sortedData1.data = response;
        this.purchaseOrdersList.data = response;
      },
      error: (error) => {
        if (error.status === 404) {
          this.loading = false;
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

  public closeModel() {
    this.showAddItem = false;
    this.sortedData1.data = [];
    this.purchaseOrdersList.data = [];
    this.poId.reset();
    this.newPoItem.reset();
    this.sortedData2.data = this.selection.selected;
  }
  public addItem() {
    this.selection.select(this.newPoItem.value);
    this.sortedData2.data = this.selection.selected;
    this.newPoItem.reset();
    this.showAddItem = false;
  }

  public clear() {
    this.selection.clear();
    this.sortedData2.data = [];
    this.poForm.reset();
  }

  public newPoId: any = 33;
  public createPO() {
    if (this.poForm.valid) {
      this.poService.createPO(this.poForm.value).subscribe({
        next: (response) => {
          this.newPoId = response;
          this.getActivePO();
          this.createBulkPoItem();
        },
        error: (error) => {
          console.error('Error creating PO:', error);
        },
      });
    }
    this.createBulkPoItem();
  }
  public createBulkPoItem() {
    if (this.newPoId && this.selection.selected.length > 0) {
      this.selection.selected.forEach((item) => {
        item.poId = this.newPoId;
      });
    }

    this.poService
      .createBulkPoItem(this.newPoId, this.selection.selected)
      .subscribe({
        next: (response) => {
          this.sortedData2.data = [];
          this.selection.clear();
          this.poForm.reset();
          this.toaster.success('Purchase Order Created Successfully ');
        },
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
  removeSelectedItem(item: any) {
    const index = this.selection.selected.findIndex(
      (selected: any) => selected.itemId === item.itemId
    );
    if (index > -1) {
      this.selection.selected.splice(index, 1);
      this.sortedData2.data = [...this.selection.selected];
    }
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
