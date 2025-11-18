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

@Component({
  selector: 'app-create-commerical-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './create-commerical-invoice.component.html',
})
export class CreateCommericalInvoiceComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;

  commercialInvoiceForm: FormGroup = new FormGroup({
    commercialInvoiceNumber: new FormControl('', Validators.required),
    purchaseOrderId: new FormControl(null),
    customerId: new FormControl(null, Validators.required),
    shipperId: new FormControl(1, Validators.required),
    shipToId: new FormControl(0),
    createdAt: new FormControl(
      new Date().toISOString().substring(0, 10),
      Validators.required
    ),

    currency: new FormControl('USD'),
    totalAmount: new FormControl(0, Validators.min(0)), // This now holds the Subtotal
    taxableAmount: new FormControl(0, Validators.min(0)), // ADDED
    shippingCharge: new FormControl(0, Validators.min(0)), // ADDED
    grandTotal: new FormControl(0, Validators.min(0)), // ADDED
    note: new FormControl(''),
    createdBy: new FormControl(0), // Keeping createdBy, though not in final payload
    selectedPoNumber: new FormControl(null, Validators.required),
    termsOfSale: new FormControl('', Validators.required),
    termsOfPayment: new FormControl('', Validators.required),
    termsOfShipping: new FormControl('', Validators.required),
    modeOfTransport: new FormControl(''),
    finalDestination: new FormControl(''),
    placeOfReceipt: new FormControl(''),
    contactName: new FormControl(''),
    contactNo: new FormControl(''),
    taxId: new FormControl(''),
    ein: new FormControl(''),
    email: new FormControl(''),
    commercialInvoiceItems: new FormArray([], Validators.required),
    invoiceDetails: new FormGroup({
      customerAddress: new FormControl('', Validators.required),
      shipToAddress: new FormControl('', Validators.required),
    }),
  });

  public incomingPOs: any[] = [];
  public customers: any = [];
  public selectedPO?: any;

  public finalCommercialInvoiceData: any;
  public finalPostData: any;
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
    private readonly toastr: ToastrService
  ) {}

  public createCommercialInvoiceItemFormGroup(
    item?: any,
    lineNumber: number = 0
  ): FormGroup {
    const itemData: any = {
      itemId: item?.itemId || 0, // Using itemId for lineItemId
      poId: item?.poId || 0, // Keeping poId for internal reference if needed
      poNumber: this.selectedPO?.poNumber || '', // Keeping poNumber for internal reference if needed
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
      ), // Will be set on generate/post
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
      totalPrice: new FormControl({
        value: totalPrice.toFixed(2),
        disabled: true,
      }),
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

  get commercialInvoiceItemsArray(): FormArray {
    return this.commercialInvoiceForm.get(
      'commercialInvoiceItems'
    ) as FormArray;
  }

  selectPO(po: any): void {
    this.isLoading = true;
    this.selectedPO = po;
    this.commercialInvoiceForm.get('purchaseOrderId')?.setValue(po.poId);
    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === po.buyerOrgId
    );
    this.commercialInvoiceForm
      .get('customerId')
      ?.setValue(this.selectedCustomer?.organizationId || null, {
        emitEvent: false,
      });
    this.commercialInvoiceForm.get('selectedPoNumber')?.setValue(po.poNumber);
    this.fetchAndSetCustomerAddresses(po.buyerOrgId, this.selectedCustomer);
    this.poService.getPO(po.poId).subscribe({
      next: (items: any[]) => {
        this.commercialInvoiceItemsArray.clear();
        if (items && items.length > 0) {
          items.forEach((item: any, index: number) => {
            this.commercialInvoiceItemsArray.push(
              this.createCommercialInvoiceItemFormGroup(item, index + 1)
            );
          });
        }
        this.isLoading = false;
        // ADDED: Calculate totals after setting items
        this.calculateGrandTotal();
        this.nextStep();
      },
      error: (err: any) => {
        this.isLoading = false;
        alert(
          'Could not load PO line items. Please check the PO ID or network connection.'
        );
      },
    });
  }

  private fetchAndSetCustomerAddresses(customerId: number, customer: any) {
    this.orgService.getOrganizationById(customerId).subscribe({
      next: (res: any) => {
        this.customerAddresses = res.addresses || [];

        const defaultAddress =
          customer?.fullAddress ||
          this.customerAddresses[0]?.fullAddress ||
          'Address not available.';

        // Patch values on the nested FormGroup
        this.commercialInvoiceForm.get('invoiceDetails')?.patchValue({
          customerAddress: defaultAddress,
          shipToAddress: defaultAddress,
        });
        // Assuming shipToId can be set from the default address if available
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
      if (this.commercialInvoiceForm.get('selectedPoNumber')?.value) {
        this.currentStep++;
      } else {
        alert('Please select a Purchase Order to continue.');
        this.commercialInvoiceForm.get('selectedPoNumber')?.markAsTouched();
      }
    } else if (this.currentStep === 2) {
      this.commercialInvoiceForm.markAllAsTouched();
      const areAllItemsValid = this.commercialInvoiceItemsArray.controls.every(
        (control) => control.valid
      );

      // Check if the main form (excluding the nested FormArray) and all items are valid
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

    // Calculate Subtotal (sum of all line item total prices)
    const subTotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );

    // Get the editable fields
    const taxable = this.commercialInvoiceForm.get('taxableAmount')?.value || 0;
    const shipping =
      this.commercialInvoiceForm.get('shippingCharge')?.value || 0;

    // Calculate Grand Total
    const grandTotal = subTotal + taxable + shipping;

    // Update form controls (totalAmount is used as Subtotal)
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

    // ADDED: Trigger grand total calculation after item total changes
    this.calculateGrandTotal();

    return totalPrice;
  }

  generateInvoice(): void {
    const formValue = this.commercialInvoiceForm.getRawValue();
    const items = formValue.commercialInvoiceItems;

    // ADDED: Recalculate totals one last time and grab the values
    this.calculateGrandTotal();
    const subTotal = this.commercialInvoiceForm.get('totalAmount')?.value;
    const taxableAmount = formValue.taxableAmount;
    const shippingCharge = formValue.shippingCharge;
    const grandTotal = this.commercialInvoiceForm.get('grandTotal')?.value;

    // Prepare the final API POST data structure based on the required payload
    this.finalPostData = {
      commercialInvoiceNumber: formValue.commercialInvoiceNumber,
      purchaseOrderId: formValue.purchaseOrderId,
      customerId: formValue.customerId,
      shipperId: formValue.shipperId,
      shipToId: formValue.shipToId,
      createdAt: formValue.createdAt,
      createdBy: formValue.createdBy,
      currency: formValue.currency,
      totalAmount: subTotal, // totalAmount now represents subTotal
      taxableAmount: taxableAmount, // ADDED
      shippingCharge: shippingCharge, // ADDED
      grandTotal: grandTotal, // ADDED
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
      note: formValue.note,
      commercialInvoiceItems: items.map((item: any) => ({
        commercialInvoiceNumber: formValue.commercialInvoiceNumber, // Ensure commercialInvoiceNumber is included in items
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

    // Prepare data for the final display step (Step 3)
    const selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === formValue.customerId
    );

    this.finalCommercialInvoiceData = {
      sellerName: this.seller?.name,
      sellerAddress: this.seller.address,
      sellerPhone: this.seller.phone,
      signerName: 'Tony Jospeh', // Static value
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
      items: this.finalPostData.commercialInvoiceItems,
      totals: {
        subTotal: subTotal,
        taxableAmount: taxableAmount, // ADDED
        shippingCharge: shippingCharge, // ADDED
        grandTotal: grandTotal, // ADDED
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
          this.generateLoding = false;
          this.toastr.success('Commercial Invoice created successfully!');
        },
        error: (err) => {
          this.generateLoding = false;
          this.toastr.error('Failed to create Commercial Invoice.');
          // Handle error
        },
      });
  }

  printCommercialInvoice() {
    window.print();
  }

  viewCommercialInvoiceDetails(invoice: any): void {
    alert(`Viewing Commercial Invoice: ${invoice.commercialInvoiceNumber}`);
  }

  downloadCommercialInvoiceCode(invoice: any): void {
    const invoiceCode = JSON.stringify(invoice, null, 2);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceCode)
    );
    element.setAttribute(
      'download',
      `commercial-invoice-${invoice.commercialInvoiceNumber}.json`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
