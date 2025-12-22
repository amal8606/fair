import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { PoService } from '../../../../../../_core/http/api/po.service';
import { CommonModule, DatePipe } from '@angular/common';
import { CommercialInvoiceService } from '../../../../../../_core/http/api/commericalInvoice.service';
import { ToastrService } from 'ngx-toastr';
import { MatTabsModule } from '@angular/material/tabs';
import { AnySrvRecord } from 'node:dns';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { PackingListService } from '../../../../../../_core/http/api/packingList.service';

@Component({
  selector: 'app-create-commerical-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
  ],
  templateUrl: './create-commerical-invoice.component.html',
})
export class CreateCommericalInvoiceComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;

  public purchaseOrdersList = new MatTableDataSource<any>();
  public sortedData1 = new MatTableDataSource<any>();
  public sortedData2 = new MatTableDataSource<any>();
  commercialInvoiceForm: FormGroup = new FormGroup({
    commercialInvoiceNumber: new FormControl(''),
    customerId: new FormControl(null, Validators.required),
    shipperId: new FormControl(1, Validators.required),
    shipToId: new FormControl(0),
    createdAt: new FormControl(
      new Date().toISOString().substring(0, 19),
      Validators.required
    ),

    currency: new FormControl('USD'),
    totalAmount: new FormControl(0, Validators.min(0)), // This now holds the Subtotal
    taxableAmount: new FormControl(0, Validators.min(0)), // ADDED
    shippingCharge: new FormControl(0, Validators.min(0)), // ADDED
    grandTotal: new FormControl(0, Validators.min(0)), // ADDED
    note: new FormControl(''),
    createdBy: new FormControl(0), // Keeping createdBy, though not in final payload
    selectedPoNumber: new FormControl(null),
    termsOfSale: new FormControl(''),
    termsOfPayment: new FormControl(''),
    termsOfShipping: new FormControl(''),
    modeOfTransport: new FormControl(''),
    finalDestination: new FormControl(''),
    placeOfReceipt: new FormControl(''),
    contactName: new FormControl(''),
    contactNo: new FormControl(''),
    taxId: new FormControl(''),
    ein: new FormControl(''),
    email: new FormControl(''),
    billOfLandingAwbNo: new FormControl(''),
    noOfBoxes: new FormControl(0, Validators.min(0)),
    noOfPallets: new FormControl(0, Validators.min(0)),
    grossWeight: new FormControl(0, Validators.min(0)),
    marksandNumbers: new FormControl(''),
    email2: new FormControl(''),
    k11: new FormControl(''),
    freightType: new FormControl(''),
    commercialInvoiceItems: new FormArray([], Validators.required),
    invoiceDetails: new FormGroup({
      customerAddress: new FormControl('', Validators.required),
      shipToAddress: new FormControl('', Validators.required),
    }),
  });

  displayedColumnsFirst: string[] = [
    'select',
    'lineNumber', // Ensure it is displayed
    'quantity', // Now shows 'Available Qty'
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
    'lineNumber', // Ensure it is displayed
    'itemId',
    'poId',
    'manufacturerModel',
    'partNumber',
    'quantity', // Now shows the SELECTED quantity
    'actualCostPerUnit',
    'unitPrice',
    'totalPrice',
    'description',
    'unit',
    'actions',
  ];

  public incomingPOs: any[] = [];
  public customers: any = [];
  public selectedPO?: any;

  public finalCommercialInvoiceData: any;
  public finalPostData: any;
  public packingListData: any;

  public isLoading: boolean = false;
  public isPoLoading: boolean = false;

  public customerAddresses: any[] = [];
  public selectedCustomer?: any;

  public commercialInvoices: any[] = [];
  public startDate: string = '';
  public endDate: string = '';
  public isCommericalLoading: boolean = false;

  seller = {
    name: 'FAIRMOUNT INTERNATIONAL LLC',
    address: '11877 91st Ave, SEMINOLE, FL. 33772',
    phone: '727-460-6757',
    fax: '321-783-3895',
  };

  constructor(
    private readonly poService: PoService,
    private readonly commercialInvoiceService: CommercialInvoiceService,
    private readonly orgService: OrgainizationService,
    private readonly packingListService: PackingListService,
    private readonly toastr: ToastrService
  ) {}

  public createCommercialInvoiceItemFormGroup(
    item?: any,
    lineNumber?: number
  ): FormGroup {
    const itemData: any = {
      itemId: item?.itemId,
      poId: item?.poId || 0,
      poNumber: item?.poNumber || '',
      quantity: item?.quantity || 1,
      unitPrice: item?.unitPrice || 0,
      description: item?.description || '',
      partNumber: item?.partNumber || '',
      countryOfOrgin: item?.countryOfOrigin || '',
      ui: item?.ui || '',
      totalPrice: item?.totalPrice || 0,
    };
    const totalPrice = itemData.quantity * itemData.unitPrice;

    return new FormGroup({
      itemId: new FormControl(itemData.itemId),
      commercialInvoiceNumber: new FormControl(
        this.commercialInvoiceForm.get('commercialInvoiceNumber')?.value || ''
      ),
      lineNumber: new FormControl(lineNumber), // Added lineNumber
      quantity: new FormControl(itemData.quantity, [
        Validators.required,
        Validators.min(1),
      ]),
      countryOfOrgin: new FormControl(itemData.countryOfOrgin),
      ui: new FormControl(itemData.ui),
      poId: new FormControl(itemData.poId),
      poNumber: new FormControl(itemData.poNumber),
      description: new FormControl(itemData.description, Validators.required),
      partNumber: new FormControl(itemData.partNumber),
      countryOfOrigin: new FormControl(itemData.countryOfOrgin),
      unitPrice: new FormControl(itemData.unitPrice, [
        Validators.required,
        Validators.min(0),
      ]),
      totalPrice: new FormControl(totalPrice.toFixed(2)),
    });
  }

  ngOnInit(): void {
    this.getCommercialInvoicablePO();
    this.getCustomer();
    this.commercialInvoiceForm
      .get('createdAt')
      ?.setValue(new Date().toISOString().substring(0, 19)); // Use ISO string

    this.commercialInvoiceForm
      .get('customerId')
      ?.valueChanges.subscribe((customerId) => {
        if (customerId) {
          this.onCustomerSelect(customerId);
        }
      });

    // ADDED: Subscribe to line item array changes to recalculate the grand total
    this.commercialInvoiceItemsArray.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
  }

  public getCommercialInvoicablePO() {
    this.isPoLoading = true;
    this.commercialInvoiceService.getInvoicableo().subscribe((res: any[]) => {
      this.isPoLoading = false;
      this.incomingPOs = res;
    });
  }

  public getCustomer() {
    this.orgService.getOrganization().subscribe({
      next: (response: any) => {
        this.customers = response;
      },
    });
  }
  public loading: boolean = false;
  public poId: FormGroup = new FormGroup({
    poId: new FormControl(null, Validators.required),
  });

  public getPO(po: any) {
    this.sortedData1.data = [];
    this.purchaseOrdersList.data = [];
    this.loading = true;
    const poParam = typeof po === 'string' ? po.trim() : po;
    let selectedPO: any;
    const parsedId = Number(poParam);
    if (!Number.isNaN(parsedId)) {
      selectedPO = this.incomingPOs.find(
        (p: any) => p.poId === parsedId || String(p.poId) === String(poParam)
      );
    } else {
      selectedPO = this.incomingPOs.find(
        (p: any) => String(p.poNumber) === String(poParam)
      );
    }
    const poNumber = selectedPO?.poNumber ?? String(poParam);
    this.poService.getPO(po).subscribe({
      next: (response: any) => {
        this.loading = false;
        const filteredResponse = response.filter(
          (item: any) => item.quantity > 0
        );
        const itemsWithSelectedQty = filteredResponse.map(
          (item: any, index: any) => ({
            ...item,
            lineNumber: item.lineNumber || index + 1,
            selectedQuantity: 0,
            totalPrice: 0,
            poNumber: poNumber,
          })
        );

        this.sortedData1.data = itemsWithSelectedQty;
        this.purchaseOrdersList.data = itemsWithSelectedQty;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.toastr.info('No items found for the selected PO.');
        } else {
        }
      },
    });
  }
  public imageUrl = 'assets/images/companyLogo.png';
  addItem() {
    const selectedItems = this.selection.selected || [];
    const existingIds = new Set(
      this.sortedData2.data.map((i: any) => i.itemId)
    );
    const itemsToAdd = selectedItems.filter(
      (item: any) => !existingIds.has(item.itemId)
    );
    if (itemsToAdd.length > 0) {
      this.sortedData2.data = [...this.sortedData2.data, ...itemsToAdd];
    }
  }
  selection = new SelectionModel<any>(true, []);

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
      const selectedItems = this.selection.selected;
      this.sortedData2.data = [...this.sortedData2.data, ...selectedItems];
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.sortedData1.data.length;
    return numSelected === numRows;
  }
  removeSelectedItem(item: any) {
    const index = this.sortedData2.data.findIndex(
      (selected: any) =>
        selected.itemId === item.itemId ||
        (selected.description === item.description &&
          selected.quantity === item.quantity)
    );
    if (index > -1) {
      this.sortedData2.data.splice(index, 1);
      this.sortedData2.data = [...this.sortedData2.data];
    }
  }

  get commercialInvoiceItemsArray(): FormArray {
    return this.commercialInvoiceForm.get(
      'commercialInvoiceItems'
    ) as FormArray;
  }

  public combainItems() {
    this.commercialInvoiceItemsArray.clear();
    if (this.selection.selected && this.selection.selected.length > 0) {
      this.selection.selected.forEach((item: any, index: number) => {
        this.commercialInvoiceItemsArray.push(
          this.createCommercialInvoiceItemFormGroup(item, index + 1)
        );
      });
    }
    this.calculateGrandTotal();
  }
  private fetchAndSetCustomerAddresses(customerId: number, customer: any) {
    this.orgService.getOrganizationById(customerId).subscribe({
      next: (res: any) => {
        this.customerAddresses = res.addresses || [];

        const defaultAddress =
          customer?.fullAddress ||
          this.customerAddresses[0]?.fullAddress ||
          'Address not available.';

        this.commercialInvoiceForm.get('invoiceDetails')?.patchValue({
          customerAddress: defaultAddress,
          shipToAddress: defaultAddress,
        });
        if (this.customerAddresses[0]?.addressId) {
          this.commercialInvoiceForm
            .get('shipToId')
            ?.setValue(this.customerAddresses[0].addressId);
        }
      },
      error: (err) => {
        this.customerAddresses = [];
      },
    });
  }

  orgId(orgId: any) {
    const org = this.customers.find((c: any) => c.organizationId == orgId);
    return org?.name;
  }
  onCustomerSelect(customerId: number): void {
    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId == customerId
    );
    if (this.selectedCustomer) {
      this.fetchAndSetCustomerAddresses(customerId, this.selectedCustomer);
    } else {
      this.customerAddresses = [];
      this.commercialInvoiceForm.get('invoiceDetails')?.patchValue({
        customerAddress: 'Select a customer first.',
        shipToAddress: 'Select a customer first.',
      });
    }
  }

  onCustomerAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    const selectedAddress = this.customerAddresses.find(
      (addr: any) => addr.addressId === +selectedAddressId
    );
    if (selectedAddress) {
      const fullAddress = [
        selectedAddress.addressLine1,
        selectedAddress.addressLine2,
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.postalCode,
        selectedAddress.country,
      ]
        .filter(Boolean)
        .join(', ');

      this.commercialInvoiceForm
        .get('invoiceDetails.customerAddress')
        ?.setValue(fullAddress);
    }
  }

  onShipToAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    const selectedAddress = this.customerAddresses.find(
      (addr: any) => addr.addressId === +selectedAddressId
    );
    if (selectedAddress) {
      const fullAddress = [
        selectedAddress.addressLine1,
        selectedAddress.addressLine2,
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.postalCode,
        selectedAddress.country,
      ]
        .filter(Boolean)
        .join(', ');

      this.commercialInvoiceForm
        .get('invoiceDetails.shipToAddress')
        ?.setValue(fullAddress);
      this.commercialInvoiceForm
        .get('shipToId')
        ?.setValue(selectedAddress.addressId);
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.selection.selected.length > 0) {
        this.combainItems();
        this.currentStep++;
      } else {
        alert('Please select items to continue.');
      }
    } else if (this.currentStep === 2) {
      this.commercialInvoiceForm.markAllAsTouched();
      const areAllItemsValid = this.commercialInvoiceItemsArray.controls.every(
        (control) => control.valid
      );

      if (this.commercialInvoiceForm.valid && areAllItemsValid) {
        this.generateInvoice();
      } else {
        alert(
          'Please correct all validation errors (including all line item fields) before proceeding.'
        );
      }
    } else if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  public calculateGrandTotal(): void {
    const items = this.commercialInvoiceItemsArray.getRawValue();

    const subTotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );

    const taxable = this.commercialInvoiceForm.get('taxableAmount')?.value || 0;
    const shipping =
      this.commercialInvoiceForm.get('shippingCharge')?.value || 0;

    const grandTotal = subTotal + taxable + shipping;

    this.commercialInvoiceForm.get('totalAmount')?.setValue(subTotal);
    this.commercialInvoiceForm.get('grandTotal')?.setValue(grandTotal);
  }

  calculateTotalPrice(itemGroup: AbstractControl): number {
    const qty = itemGroup.get('quantity')?.value || 0;
    const price = itemGroup.get('unitPrice')?.value || 0;
    const totalPrice = qty * price;

    itemGroup
      .get('totalPrice')
      ?.setValue(totalPrice.toFixed(2), { emitEvent: false });

    itemGroup.get('totalPrice')?.setValue(totalPrice, { emitEvent: false });

    this.calculateGrandTotal();

    return totalPrice;
  }

  generateInvoice(): void {
    const formValue = this.commercialInvoiceForm.getRawValue();
    const items = formValue.commercialInvoiceItems;

    this.calculateGrandTotal();
    const subTotal = this.commercialInvoiceForm.get('totalAmount')?.value;
    const taxableAmount = formValue.taxableAmount;
    const shippingCharge = formValue.shippingCharge;
    const grandTotal = this.commercialInvoiceForm.get('grandTotal')?.value;

    this.finalPostData = {
      commercialInvoiceNumber: formValue.commercialInvoiceNumber,
      purchaseOrderId: formValue.purchaseOrderId,
      customerId: formValue.customerId,
      shipperId: formValue.shipperId,
      shipToId: formValue.shipToId,
      createdAt: formValue.createdAt,
      createdBy: formValue.createdBy,
      currency: formValue.currency,
      totalAmount: subTotal,
      taxableAmount: taxableAmount,
      shippingCharge: shippingCharge,
      grandTotal: grandTotal,
      termsOfSale: formValue.termsOfSale,
      termsOfPayment: formValue.termsOfPayment,
      termsOfShipping: formValue.termsOfShipping,
      modeOfTransport: formValue.modeOfTransport,
      placeOfReceipt: formValue.placeOfReceipt,
      finalDestination: formValue.finalDestination,
      contactNo: formValue.contactNo,
      contactName: formValue.contactName,
      taxId: formValue.taxId,
      ein: formValue.ein,
      email: formValue.email,
      commercialInvoiceItems: items.map((item: any) => ({
        commercialInvoiceNumber: formValue.commercialInvoiceNumber,
        itemId: item.itemId,
        partNumber: item.partNumber,
        poNumber: item.poNumber,
        countryOfOrgin: item.countryOfOrgin,
        ui: item.ui,
        poId: item.poId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
    };
    this.packingListData = {
      commercialInvoiceNumber: formValue.commercialInvoiceNumber,
      customerId: formValue.customerId,
      shipperId: formValue.shipperId,
      shipToId: formValue.shipToId,
      createdAt: formValue.createdAt,
      createdBy: formValue.createdBy,
      currency: formValue.currency,
      termsOfSale: formValue.termsOfSale,
      termsOfPayment: formValue.termsOfPayment,
      termsOfShipping: formValue.termsOfShipping,
      modeOfTransport: formValue.modeOfTransport,
      placeOfReceipt: formValue.placeOfReceipt,
      finalDestination: formValue.finalDestination,
      contactNo: formValue.contactNo,
      contactName: formValue.contactName,
      taxId: formValue.taxId,
      ein: formValue.ein,
      email: formValue.email,
      email2: formValue.email2,
      note: formValue.note,
      billOfLandingAwbNo: formValue.billOfLandingAwbNo,
      numberOfBoxes: formValue.noOfBoxes,
      numberOfPallets: formValue.noOfPallets,
      grossWeight: formValue.grossWeight,
      marksandNumbers: formValue.marksandNumbers,
      k11: formValue.k11,
      packingListItems: items.map((item: any) => ({
        itemId: item.itemId,
        partNumber: item.partNumber,
        poNumber: item.poNumber,
        countryOfOrgin: item.countryOfOrgin,
        ui: item.ui,
        poId: item.poId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
    };

    const selectedCustomer = this.customers.find(
      (c: any) => c.organizationId == formValue.customerId
    );

    this.finalCommercialInvoiceData = {
      sellerName: this.seller?.name,
      sellerAddress: this.seller.address,
      sellerPhone: this.seller.phone,
      signerName: 'Tony Jospeh',
      signDate: formValue.createdAt,
      commercialInvoiceNumber: formValue.commercialInvoiceNumber,
      createdAt: formValue.createdAt,
      poNumber: formValue.selectedPoNumber,
      customerId: formValue.customerId,
      contactName: formValue.contactName,
      contactNo: formValue.contactNo,
      taxId: formValue.taxId,
      ein: formValue.ein,
      email: formValue.email,
      note: formValue.note,
      customerName: selectedCustomer?.name || 'N/A',
      customerAddress: formValue.invoiceDetails.customerAddress,
      shipToAddress: formValue.invoiceDetails.shipToAddress,
      freightType: formValue.freightType,
      termsOfSale: formValue.termsOfSale,
      termsOfPayment: formValue.termsOfPayment,
      termsOfShipping: formValue.termsOfShipping,
      modeOfTransport: formValue.modeOfTransport,
      finalDestination: formValue.finalDestination,
      placeOfReceipt: formValue.placeOfReceipt,
      currency: formValue.currency,
      email2: formValue.email2,
      k11: formValue.k11,
      noOfBoxes: formValue.noOfBoxes,
      billOfLandingAwbNo: formValue.billOfLandingAwbNo,
      noOfPallets: formValue.noOfPallets,
      grossWeight: formValue.grossWeight,
      marksandNumbers: formValue.marksandNumbers,
      items: this.finalPostData.commercialInvoiceItems,
      totals: {
        subTotal: subTotal,
        taxableAmount: taxableAmount,
        shippingCharge: shippingCharge,
        grandTotal: grandTotal,
        currency: formValue.currency,
      },
    };
    this.currentStep = 3;
  }
  public generateLoding: boolean = false;
  postInvoice() {
    this.generateLoding = true;

    this.commercialInvoiceService
      .postCommercialInvoice(this.finalPostData)
      .subscribe({
        next: (res) => {
          this.postPackingList(res.commercialInvoiceId);

          this.toastr.success('Commercial Invoice created successfully!');
        },
        error: (err) => {
          this.generateLoding = false;
          this.toastr.error('Failed to create Commercial Invoice.');
        },
      });
  }
  postPackingList(ciId: any) {
    this.packingListData = {
      ...this.packingListData,
      commercialInvoiceId: ciId,
    };
    this.packingListService.postPackingList(this.packingListData).subscribe({
      next: (res) => {
        this.generateLoding = false;

        this.toastr.success('Packing List created successfully!');
      },
      error: (err) => {
        this.generateLoding = false;
        this.toastr.error('Failed to create Packing List.');
      },
    });
  }

  printCommercialInvoice() {
    const invoiceNumber = this.commercialInvoiceForm.get(
      'commercialInvoiceNumber'
    )?.value;
    const originalTitle = document.title;

    if (invoiceNumber) {
      document.title = `FM-${invoiceNumber}`;
    }

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  }

  viewCommercialInvoiceDetails(invoice: any): void {
    alert(`Viewing Commercial Invoice: ${invoice.commercialInvoiceNumber}`);
  }

  downloadCommercialInvoiceCode(invoice: any): void {
    const invoiceCode = JSON.stringify(invoice, null, 2);

    const invoiceNumber = invoice?.commercialInvoiceNumber || 'NoInvoiceNumber';
    const fileName = `FM-${invoiceNumber}.json`;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceCode)
    );
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
