import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { PoService } from '../../../../../_core/http/api/po.service';
import { InvoiceService } from '../../../../../_core/http/api/invoice.service';
import { OrgainizationService } from '../../../../../_core/http/api/orginization.service';

// --- Data Structures (Interfaces) ---

@Component({
  selector: 'app-pro-forma-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './pro-forma-invoice.component.html',
})
export class ProFormaInvoiceComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;

  proFormaForm: FormGroup = new FormGroup({
    proformaNumber: new FormControl('', Validators.required),
    purchaseOrderId: new FormControl(null),
    customerId: new FormControl(null, Validators.required),
    shipToId: new FormControl(0),
    freightType: new FormControl('PICK UP'),
    currencyCode: new FormControl('USD'),
    totalAmount: new FormControl(0, Validators.min(0)),
    notes: new FormControl(''),
    estimatedShipDate: new FormControl(''),
    status: new FormControl('Pending'),
    createdBy: new FormControl(0),
    createdAt: new FormControl(
      new Date().toISOString().substring(0, 10),
      Validators.required
    ),
    proformaItems: new FormArray([], Validators.required),
    selectedPoNumber: new FormControl(null, Validators.required),

    // NEW NESTED FORM GROUP FOR ADDRESSES
    invoiceDetails: new FormGroup({
      customerAddress: new FormControl('', Validators.required),
      shipToAddress: new FormControl('', Validators.required),
    }),
  });

  public incomingPOs: any[] = [];
  public customers: any = [];
  public selectedPO?: any;

  public finalInvoiceData: any;
  public isLoading: boolean = false;

  // NEW PROPERTIES FOR ADDRESS MANAGEMENT
  public customerAddresses: any[] = [];
  public selectedCustomer?: any;

  seller = {
    name: 'FAIRMOUNT INTERNATIONAL LLC',
    address: '11877 91st Ave, SEMINOLE, FL. 33772',
    phone: '727-460-6757',
    fax: '321-783-3895',
  };

  constructor(
    private readonly poService: PoService,
    private readonly invoiceService: InvoiceService,
    private readonly orgService: OrgainizationService
  ) {}

  public createProformaItemFormGroup(item?: any): FormGroup {
    const itemData: any = {
      itemId: item?.itemId || 0,
      poId: item?.poId || 0,
      quantity: item?.quantity || 1,
      unit: item?.unit || 'EA',
      description: item?.description || '',
      manufacturerModel: item?.manufacturerModel || '',
      partNumber: item?.partNumber || '',
      traceabilityRequired: item?.traceabilityRequired || 0,
      unitPrice: item?.unitPrice || 0,
      totalPrice: item?.totalPrice || 0,
      actualCostPerUnit: item?.actualCostPerUnit || 0,
      statusId: item?.statusId || 0,
      terms: item?.terms || '',
      itemStatus: item?.itemStatus || null,
    };

    const extendedPrice = itemData.quantity * itemData.unitPrice;

    return new FormGroup({
      itemId: new FormControl(itemData.itemId),
      quantity: new FormControl(itemData.quantity, [
        Validators.required,
        Validators.min(1),
      ]),
      unit: new FormControl(itemData.unit || 'EA', Validators.required),
      description: new FormControl(itemData.description, Validators.required),
      manufacturerModel: new FormControl(itemData.manufacturerModel),
      partNumber: new FormControl(itemData.partNumber),
      traceabilityRequired: new FormControl(itemData.traceabilityRequired),
      unitPrice: new FormControl(itemData.unitPrice, [
        Validators.required,
        Validators.min(0),
      ]),
      totalPrice: new FormControl(itemData.totalPrice),
      actualCostPerUnit: new FormControl(
        itemData.actualCostPerUnit,
        Validators.min(0)
      ),
      statusId: new FormControl(itemData.statusId || 0),
      terms: new FormControl(itemData.terms),
      // Read-only field for UI display
      extendedPrice: new FormControl({
        value: extendedPrice.toFixed(2),
        disabled: true,
      }),
    });
  }

  ngOnInit(): void {
    this.getProFormaInvoicablePO();
    this.getCustomer();
    // Set the initial creation date (formatted as 'YYYY-MM-DD' for date input)
    this.proFormaForm
      .get('createdAt')
      ?.setValue(new Date().toISOString().substring(0, 10));

    // Listen to changes on the customerId control to handle manual selection in Step 2.
    this.proFormaForm
      .get('customerId')
      ?.valueChanges.subscribe((customerId) => {
        if (customerId) {
          this.onCustomerSelect(customerId);
        }
      });
  }

  // --- Data Fetching Methods ---

  public getPOs() {
    this.poService.getActivePO().subscribe((res: any[]) => {
      this.incomingPOs = res.filter((po: any) => po.poType === 'Incoming');
    });
  }
  public getProFormaInvoicablePO() {
    this.invoiceService.getProFormaInvoicablePO().subscribe((res: any[]) => {
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

  get itemsArray(): FormArray {
    return this.proFormaForm.get('proformaItems') as FormArray;
  }

  selectPO(po: any): void {
    this.isLoading = true;
    this.selectedPO = po;
    this.proFormaForm.get('purchaseOrderId')?.setValue(po.id);

    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === po.buyerOrgId
    );

    // Set customerId without emitting event to prevent double-call to onCustomerSelect
    this.proFormaForm
      .get('customerId')
      ?.setValue(this.selectedCustomer?.organizationId || null, {
        emitEvent: false,
      });

    this.proFormaForm.get('selectedPoNumber')?.setValue(po.poNumber);

    // Call the customer selection logic to fetch and set addresses
    this.fetchAndSetCustomerAddresses(po.buyerOrgId, this.selectedCustomer);

    this.poService.getPO(po.id).subscribe({
      next: (items: any[]) => {
        this.itemsArray.clear();
        if (items && items.length > 0) {
          items.forEach((item: any) => {
            this.itemsArray.push(this.createProformaItemFormGroup(item));
          });
        }

        this.isLoading = false;
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

  /**
   * Fetches all addresses for a given customer and sets the default address in the form.
   */
  private fetchAndSetCustomerAddresses(customerId: number, customer: any) {
    this.orgService.getOrganizationById(customerId).subscribe({
      next: (res: any) => {
        // Assuming addresses come back as an array of address objects
        this.customerAddresses = res.addresses || [];

        // Determine a default address to display
        const defaultAddress =
          customer?.fullAddress ||
          this.customerAddresses[0]?.fullAddress ||
          'Address not available.';

        // Patch values on the nested FormGroup
        this.proFormaForm.get('invoiceDetails')?.patchValue({
          customerAddress: defaultAddress,
          shipToAddress: defaultAddress,
        });
      },
      error: (err) => {
        this.customerAddresses = [];
      },
    });
  }

  /**
   * Handles manual customer selection from the dropdown in Step 2.
   * @param customerId The ID of the selected customer organization.
   */
  onCustomerSelect(customerId: number): void {
    // Find the customer using 'organizationId' which is the value used in the select
    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === customerId
    );

    if (this.selectedCustomer) {
      // Fetch addresses for the new customer and set the default address
      this.fetchAndSetCustomerAddresses(customerId, this.selectedCustomer);
    } else {
      this.customerAddresses = [];
      this.proFormaForm.get('invoiceDetails')?.patchValue({
        customerAddress: 'Select a customer first.',
        shipToAddress: 'Select a customer first.',
      });
    }
  }

  /**
   * Handles selection from the Customer Address dropdown.
   */
  onCustomerAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    // Find the selected address object from customerAddresses
    const selectedAddress = this.customerAddresses.find(
      (addr: any) => addr.addressId === +selectedAddressId
    );
    if (selectedAddress) {
      // Format the address as a readable string
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

      // Update form control
      this.proFormaForm
        .get('invoiceDetails.customerAddress')
        ?.setValue(fullAddress);
    }
  }

  /**
   * Handles selection from the Ship To Address dropdown.
   */
  onShipToAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    // Find the selected address object from customerAddresses
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

      // Update form control
      this.proFormaForm
        .get('invoiceDetails.shipToAddress')
        ?.setValue(fullAddress);
      this.proFormaForm.get('shipToId')?.setValue(selectedAddress.addressId);
    }
  }

  // --- (Navigation and Calculation methods) ---

  nextStep(): void {
    // Step 1 validation: Check if PO is selected
    if (this.currentStep === 1) {
      if (this.proFormaForm.get('selectedPoNumber')?.value) {
        this.currentStep++;
      } else {
        alert('Please select a Purchase Order to continue.');
        this.proFormaForm.get('selectedPoNumber')?.markAsTouched();
      }
    }
    // Step 2 validation: Check form validity and generate invoice data
    else if (this.currentStep === 2) {
      this.proFormaForm.markAllAsTouched();
      // Also ensure the items array has at least one valid item
      const areAllItemsValid = this.itemsArray.controls.every(
        (control) => control.valid
      );

      if (this.proFormaForm.valid && areAllItemsValid) {
        this.generateInvoice();
      } else {
        alert(
          'Please correct all validation errors (including all line item fields) before proceeding.'
        );
      }
    }
    // General step increment (shouldn't be reached if logic above is followed)
    else if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  calculateExtendedPrice(itemGroup: AbstractControl): number {
    const qty = itemGroup.get('quantity')?.value || 0;
    const price = itemGroup.get('unitPrice')?.value || 0;
    const extendedPrice = qty * price;

    // Update the extendedPrice UI field (read-only)
    itemGroup
      .get('extendedPrice')
      ?.setValue(extendedPrice.toFixed(2), { emitEvent: false });

    // Update the totalPrice posting field
    itemGroup.get('totalPrice')?.setValue(extendedPrice, { emitEvent: false });

    return extendedPrice;
  }
  // onclick="window.print()"
  finalProFormaPostData: any;
  generateInvoice(): void {
    const formValue = this.proFormaForm.getRawValue();
    const invoiceDetails = formValue.invoiceDetails;
    const items = formValue.proformaItems;
    const subTotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );
    const selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === formValue.customerId
    );

    this.finalProFormaPostData = {
      proformaNumber: formValue.proformaNumber,
      purchaseOrderId: formValue.purchaseOrderId,
      customerId: formValue.customerId,
      shipToId: formValue.shipToId,
      freightType: formValue.freightType,
      currencyCode: formValue.currencyCode,
      totalAmount: subTotal,
      notes: formValue.notes,
      estimatedShipDate: formValue.estimatedShipDate,
      status: formValue.status,
      createdBy: formValue.createdBy,
      createdAt: formValue.createdAt,
      proformaItems: items.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unit: item.unit,
        description: item.description,
        manufacturerModel: item.manufacturerModel,
        partNumber: item.partNumber,
        traceabilityRequired: item.traceabilityRequired,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        actualCostPerUnit: item.actualCostPerUnit,
        statusId: item.statusId,
        terms: item.terms,
      })),
    };
    this.proFormaForm.get('totalAmount')?.setValue(subTotal);

    this.finalInvoiceData = {
      sellerName: this.seller.name,
      sellerAddress: this.seller.address,
      sellerPhone: this.seller.phone,
      signerName: 'Tony Jospeh',
      signDate: formValue.createdAt,
      invoiceNumber: formValue.proformaNumber,
      date: formValue.createdAt,
      poNumber: formValue.selectedPoNumber,
      customerId: formValue.customerId,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerAddress: invoiceDetails.customerAddress,
      shipToAddress: invoiceDetails.shipToAddress,
      freightType: formValue.freightType,
      estimatedShipDate: formValue.estimatedShipDate,

      // Line Items & Totals
      items: this.finalProFormaPostData.proformaItems,
      notes: formValue.notes,
      totals: {
        subTotal: subTotal,
        total: subTotal,
        currency: formValue.currencyCode,
      },
    };

    this.currentStep = 3; // Manually move to step 3
  }
  postInvoice() {
    this.invoiceService
      .postProFormaInvoiceData(this.finalProFormaPostData)
      .subscribe({});
  }
  printProForma() {
    window.print();
  }
}
