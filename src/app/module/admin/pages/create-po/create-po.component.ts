import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
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
import { OrgainizationService } from '../../../../_core/http/api/orginization.service';

export interface PoItem {
  itemId?: number;
  poId: number | string;
  quantity: number; // Original quantity in the PO
  unit: string;
  description: string;
  manufacturerModel: string;
  partNumber: string;
  traceabilityRequired?: string | number;
  unitPrice: number;
  totalPrice: number;
  actualCostPerUnit: number;
  terms?: string;
  lineNumber?: number;
  selectedQuantity?: number; // << NEW: Quantity the user wants to select
}

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
export class CreatePoComponent implements OnInit {
  constructor(
    private readonly poService: PoService,
    private readonly toaster: ToastrService,
    private readonly orgainizationService: OrgainizationService,
  ) {}

  @ViewChild(MatSort) matSort!: MatSort;

  public purchaseOrdersList = new MatTableDataSource<PoItem>();
  public sortedData1 = new MatTableDataSource<PoItem>();
  public sortedData2 = new MatTableDataSource<PoItem>();

  displayedColumnsFirst: string[] = [
    'select',
    'selectedQuantity',
    'lineNumber',
    'quantity',
    'itemId',
    'poId',
    'manufacturerModel',
    'partNumber',
    'actualCostPerUnit',
    'unitPrice',
    'totalPrice',
    'description',
    'unit',
  ];

  displayedColumnsSecond: string[] = [
    'lineNumber',
    'itemId',
    'poId',
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
    poTypeId: new FormControl(1),
    customerId: new FormControl(null, Validators.required),
    buyerOrgId: new FormControl(null),
    supplier: new FormControl('', Validators.required),
    destination: new FormControl('', Validators.required),
    paymentTerms: new FormControl('', Validators.required),
    deliveryTerms: new FormControl('', Validators.required),
    shippingCharges: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    discount: new FormControl(0, [Validators.min(0)]),
    orderDate: new FormControl(this.formatDate(this.date), Validators.required),
    modeOfShipment: new FormControl('', Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    totalCost: new FormControl(null, Validators.required),
    createdBy: new FormControl('1', Validators.required),
    active: new FormControl(1, Validators.required),
  });

  public poId: FormGroup = new FormGroup({
    poId: new FormControl(null, Validators.required),
  });

  public newPoItem: FormGroup = new FormGroup({
    poId: new FormControl(null),
    quantity: new FormControl(null, Validators.required),
    unit: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    manufacturerModel: new FormControl('', Validators.required),
    partNumber: new FormControl('', Validators.required),
    traceabilityRequired: new FormControl(0),
    unitPrice: new FormControl(null, Validators.required),
    totalPrice: new FormControl(null),
    actualCostPerUnit: new FormControl(null, Validators.required),
    terms: new FormControl(''),
    countryOfOrigin: new FormControl(''),
    hsc: new FormControl(''),
    weightDim: new FormControl(''),
  });

  public customers: any = [];
  public showAddItem: boolean = false;
  public addNewItem: boolean = true;
  public addExisting: boolean = false;
  public isLoading: boolean = false;
  public loading = false;
  public poList: any;
  public newPoId: any;
  public poTypeId: any;

  get hasInvalidSelectedItems(): boolean {
    return this.selection.selected.some((item) => {
      const qty = item.selectedQuantity || 0;
      return qty > item.quantity || qty <= 0;
    });
  }

  ngOnInit() {
    this.getActivePO();
    this.getCustomer();
  }

  public getActivePO() {
    this.poService.getActivePO().subscribe({
      next: (response: any[]) => {
        this.poList = response.filter(
          (po: any) =>
            (po.poType === 'Incoming' || po.poType === 'DummyPO') &&
            (po.poStatusId === 4 || po.poStatusId === 12 || po.poStatusId === 3),
        );
      },
      error: (error: any) => {
        this.toaster.error('Error fetching active POs');
      },
    });
  }

  public getPO() {
    this.sortedData1.data = [];
    this.purchaseOrdersList.data = [];
    this.loading = true;
    this.selection.clear();
    const poId = this.poId.get('poId')?.value;

    this.poService.getPO(poId).subscribe({
      next: (response: PoItem[]) => {
        this.loading = false;
        const filteredResponse = response.filter((item: any) => {
          const remaining = item.quantity - (item.invoicedQty ?? 0);
          return remaining > 0;
        });
        const itemsWithSelectedQty = filteredResponse.map((item: any) => {
          const remainingQty = item.quantity - (item.invoicedQty ?? 0);

          return {
            ...item,
            quantity: remainingQty, // The new quantity is now the available balance
            lineNumber: item.lineNumber,
            hsc: item.hsc,
            weightDim: item.weightDim,
            selectedQuantity: 0,
            totalPrice: 0,
          };
        });

        this.sortedData1.data = itemsWithSelectedQty;
        this.purchaseOrdersList.data = itemsWithSelectedQty;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.toaster.info('No items found for the selected PO.');
        } else {
          this.toaster.error('Error fetching PO items');
        }
      },
    });
  }

  public updateSelectionQuantity(row: PoItem, event: any) {
    let newQty = parseInt(event.target.value, 10);

    if (isNaN(newQty) || newQty < 0) {
      newQty = 0;
    }

    row.selectedQuantity = newQty;

    if (newQty > 0) {
      if (!this.selection.isSelected(row)) {
        this.selection.select(row);
      }
    } else {
      if (this.selection.isSelected(row)) {
        this.selection.deselect(row);
      }
    }

    if (row.selectedQuantity && row.unitPrice) {
      row.totalPrice = row.selectedQuantity * row.unitPrice;
    } else {
      row.totalPrice = 0;
    }
  }

  public getCustomer() {
    this.orgainizationService.getOrganization().subscribe({
      next: (response: any) => {
        this.customers = response;
      },
      error: (error: any) => {
        this.toaster.error('Error fetching customers');
      },
    });
  }

  public createPO() {
    if (this.poForm.valid && this.sortedData2.data.length > 0) {
      this.isLoading = true;
      this.poForm.patchValue({
        buyerOrgId: this.poForm.get('customerId')?.value,
      });
      this.poService.createPO(this.poForm.value).subscribe({
        next: (response) => {
          this.newPoId = response.id;
          this.poTypeId = response.poTypeId;
          this.getActivePO();
          this.createBulkPoItem();
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Something went wrong';
          this.toaster.error(errorMessage);
        },
      });
    } else {
      this.poForm.markAllAsTouched();
      if (this.poForm.invalid) {
        this.toaster.error('Please fill all required fields.');
      }
      if (this.sortedData2.data.length === 0) {
        this.toaster.warning('Please add at least one item to the PO.');
      }
    }
  }

  public createBulkPoItem() {
    if (this.newPoId && this.sortedData2.data.length > 0 && this.poTypeId) {
      const itemsToCreate: PoItem[] = this.sortedData2.data.map(
        (item: PoItem) => ({
          ...item,
          poId: this.newPoId,
          poNumber: this.poForm.get('poNumber')?.value || '',
          itemId: item.itemId,
          lineNumber: item.lineNumber,
        }),
      );

      this.poService
        .createBulkPoItem(this.newPoId, this.poTypeId, itemsToCreate)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.sortedData2.data = [];
            this.selection.clear();
            this.poForm.reset({
              orderDate: this.formatDate(this.date),
              createdBy: '1',
              active: 1,
              shippingCharges: 0,
              discount: 0,
            });
            this.toaster.success('Purchase Order Created Successfully');
          },
          error: (error) => {
            this.isLoading = false;
            this.toaster.error(
              'Purchase Order created, but error adding items.',
            );
          },
        });
    } else if (!this.newPoId) {
      this.isLoading = false;
    }
  }

  public closeModel() {
    this.showAddItem = false;

    const itemsToTransfer: PoItem[] = this.selection.selected
      .filter((item) => (item.selectedQuantity || 0) > 0)
      .map((item) => ({
        ...item,
        quantity: item.selectedQuantity!,
        selectedQuantity: undefined, // Clear this as it's not needed in the main table
      }));

    const currentItems = [...this.sortedData2.data];

    itemsToTransfer.forEach((newItem) => {
      const exists = currentItems.find(
        (existing) => existing.itemId === newItem.itemId,
      );

      if (exists) {
        exists.quantity += newItem.quantity;
        exists.totalPrice = exists.quantity * exists.unitPrice;
      } else {
        currentItems.push(newItem);
      }
    });

    this.sortedData2.data = currentItems;

    this.sortedData1.data = [];
    this.purchaseOrdersList.data = [];
    this.poId.reset({ poId: null });
    this.newPoItem.reset({ traceabilityRequired: 0 });
    this.selection.clear();
  }
  public addItem() {
    if (this.newPoItem.valid) {
      const formValue = this.newPoItem.value;
      const total = formValue.quantity * formValue.unitPrice;

      const newLineNumber = this.sortedData2.data.length + 1;

      const newItem: PoItem = {
        ...formValue,
        poId: 'NEW',
        lineNumber: newLineNumber,
        totalPrice: total,
      };
      this.selection.select(newItem);
      this.sortedData2.data = [...this.sortedData2.data, newItem];

      this.newPoItem.reset({ traceabilityRequired: 0 });
      this.showAddItem = false;
    } else {
      this.newPoItem.markAllAsTouched();
    }
  }

  public clear() {
    this.selection.clear();
    this.sortedData2.data = [];
    this.poForm.reset({
      orderDate: this.formatDate(this.date),
      createdBy: '1',
      active: 1,
      shippingCharges: 0,
      discount: 0,
    });
  }

  selection = new SelectionModel<PoItem>(true, []);

  masterToggle() {
    const isAllSelected = this.isAllSelected();
    this.sortedData1.data.forEach((row) => {
      if (!isAllSelected) {
        this.selection.select(row);
        row.selectedQuantity = row.quantity;
        row.totalPrice = row.quantity * row.unitPrice;
      } else {
        this.selection.deselect(row);
        row.selectedQuantity = 0;
        row.totalPrice = 0;
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.sortedData1.data.length;
    return numSelected === numRows;
  }

  removeSelectedItem(item: PoItem) {
    const index = this.sortedData2.data.findIndex(
      (selected: PoItem) =>
        selected.itemId === item.itemId ||
        (selected.description === item.description &&
          selected.quantity === item.quantity),
    );
    if (index > -1) {
      this.sortedData2.data.splice(index, 1);
      this.sortedData2.data = [...this.sortedData2.data];
    }
  }

  // ... (sortData and compare methods remain the same)
  sortData(sort: Sort) {
    const data = this.purchaseOrdersList.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData1.data = data;
      return;
    }
    this.sortedData1.data = data.sort((a: PoItem, b: PoItem) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'itemId':
          return this.compare(a.itemId || 0, b.itemId || 0, isAsc);
        case 'poId':
          return this.compare(a.poId, b.poId, isAsc);
        case 'lineNumber':
          return this.compare(a.lineNumber || 0, b.lineNumber || 0, isAsc);
        case 'manufacturerModel':
          return this.compare(a.manufacturerModel, b.manufacturerModel, isAsc);
        case 'partNumber':
          return this.compare(a.partNumber, b.partNumber, isAsc);
        case 'quantity':
          return this.compare(a.quantity, b.quantity, isAsc);
        case 'unitPrice':
          return this.compare(a.unitPrice, b.unitPrice, isAsc);
        case 'actualCostPerUnit':
          return this.compare(a.actualCostPerUnit, b.actualCostPerUnit, isAsc);
        case 'totalPrice':
          return this.compare(a.totalPrice, b.totalPrice, isAsc);
        case 'description':
          return this.compare(a.description, b.description, isAsc);
        case 'unit':
          return this.compare(a.unit, b.unit, isAsc);
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
}
