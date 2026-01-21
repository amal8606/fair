import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { PoService } from '../../../../../../_core/http/api/po.service';
import { InvoiceService } from '../../../../../../_core/http/api/invoice.service';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { InvoicedProFormaComponent } from '../invoiced-pro-forma/invoiced-pro-forma.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pro-forma-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule],
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
    customerAddressId: new FormControl(0),
    freightType: new FormControl('PICK UP'),
    currencyCode: new FormControl('USD'),
    totalAmount: new FormControl(0, Validators.min(0)),
    notes: new FormControl(''),
    estimatedShipDate: new FormControl(''),
    status: new FormControl('Pending'),
    createdBy: new FormControl(0),
    createdAt: new FormControl(
      new Date().toISOString().substring(0, 10),
      Validators.required,
    ),
    proformaItems: new FormArray([], Validators.required),
    selectedPoNumber: new FormControl(null, Validators.required),

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
  public isPoLoading: boolean = false;

  public customerAddresses: any[] = [];
  public selectedCustomer?: any;

  // Pro Forma Invoice History
  public proFormaInvoices: any[] = [];
  public startDate: string = '';
  public endDate: string = '';
  public isProFormaLoading: boolean = false;
  public showProFormaHistory: boolean = false;

  seller = {
    name: 'FAIRMOUNT INTERNATIONAL LLC',
    address: '11877 91st Ave, SEMINOLE, FL. 33772',
    phone: '727-460-6757',
    fax: '321-783-3895',
  };

  constructor(
    private readonly poService: PoService,
    private readonly invoiceService: InvoiceService,
    private readonly orgService: OrgainizationService,
    private readonly toastr: ToastrService,
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
        Validators.min(0),
      ),
      statusId: new FormControl(itemData.statusId || 0),
      terms: new FormControl(itemData.terms),
      extendedPrice: new FormControl({
        value: extendedPrice.toFixed(2),
        disabled: true,
      }),
    });
  }

  ngOnInit(): void {
    this.getProFormaInvoicablePO();
    this.getCustomer();
    this.proFormaForm
      .get('createdAt')
      ?.setValue(new Date().toISOString().substring(0, 10));
    this.proFormaForm
      .get('customerId')
      ?.valueChanges.subscribe((customerId) => {
        if (customerId) {
          this.onCustomerSelect(customerId);
        }
      });
  }

  public getProFormaInvoicablePO() {
    this.isPoLoading = true;
    this.invoiceService.getProFormaInvoicablePO().subscribe((res: any[]) => {
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

  get itemsArray(): FormArray {
    return this.proFormaForm.get('proformaItems') as FormArray;
  }

  selectPO(po: any): void {
    this.isLoading = true;
    this.selectedPO = po;
    this.proFormaForm.get('purchaseOrderId')?.setValue(po.id);
    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === po.buyerOrgId,
    );
    this.proFormaForm
      .get('customerId')
      ?.setValue(this.selectedCustomer?.organizationId || null, {
        emitEvent: false,
      });
    this.proFormaForm.get('selectedPoNumber')?.setValue(po.poNumber);
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
          'Could not load PO line items. Please check the PO ID or network connection.',
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

  orgId(orgId: any) {
    const org = this.customers.find((c: any) => c.organizationId == orgId);
    return org.name;
  }
  onCustomerSelect(customerId: number): void {
    this.selectedCustomer = this.customers.find(
      (c: any) => c.organizationId == customerId,
    );
    if (this.selectedCustomer) {
      this.fetchAndSetCustomerAddresses(customerId, this.selectedCustomer);
    } else {
      this.customerAddresses = [];
      this.proFormaForm.get('invoiceDetails')?.patchValue({
        customerAddress: 'Select a customer first.',
        shipToAddress: 'Select a customer first.',
      });
    }
  }

  onCustomerAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    const selectedAddress = this.customerAddresses.find(
      (addr: any) => addr.addressId === +selectedAddressId,
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

      this.proFormaForm
        .get('invoiceDetails.customerAddress')
        ?.setValue(fullAddress);
      this.proFormaForm
        .get('customerAddressId')
        ?.setValue(selectedAddress.addressId);
    }
  }

  onShipToAddressSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedAddressId = selectElement.value;

    const selectedAddress = this.customerAddresses.find(
      (addr: any) => addr.addressId === +selectedAddressId,
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

      this.proFormaForm
        .get('invoiceDetails.shipToAddress')
        ?.setValue(fullAddress);
      this.proFormaForm.get('shipToId')?.setValue(selectedAddress.addressId);
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.proFormaForm.get('selectedPoNumber')?.value) {
        this.currentStep++;
      } else {
        alert('Please select a Purchase Order to continue.');
        this.proFormaForm.get('selectedPoNumber')?.markAsTouched();
      }
    } else if (this.currentStep === 2) {
      this.proFormaForm.markAllAsTouched();
      const areAllItemsValid = this.itemsArray.controls.every(
        (control) => control.valid,
      );

      if (this.proFormaForm.valid && areAllItemsValid) {
        this.generateInvoice();
      } else {
        alert(
          'Please correct all validation errors (including all line item fields) before proceeding.',
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

  calculateExtendedPrice(itemGroup: AbstractControl): number {
    const qty = itemGroup.get('quantity')?.value || 0;
    const price = itemGroup.get('unitPrice')?.value || 0;
    const extendedPrice = qty * price;

    itemGroup
      .get('extendedPrice')
      ?.setValue(extendedPrice.toFixed(2), { emitEvent: false });

    itemGroup.get('totalPrice')?.setValue(extendedPrice, { emitEvent: false });

    return extendedPrice;
  }
  finalProFormaPostData: any;
  generateInvoice(): void {
    const formValue = this.proFormaForm.getRawValue();
    const invoiceDetails = formValue.invoiceDetails;
    const items = formValue.proformaItems;
    const subTotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0,
    );
    const selectedCustomer = this.customers.find(
      (c: any) => c.organizationId === formValue.customerId,
    );

    this.finalProFormaPostData = {
      proformaNumber: formValue.proformaNumber,
      purchaseOrderId: formValue.purchaseOrderId,
      customerId: formValue.customerId,
      shipToId: formValue.shipToId,
      customerAddressId: formValue.customerAddressId,
      freightType: formValue.freightType,
      currencyCode: formValue.currencyCode,
      totalAmount: subTotal,
      notes: formValue.notes,
      estimatedShipDate: formValue.estimatedShipDate,
      status: formValue.status,
      sellerFax: this.seller.fax,
      createdBy: formValue.createdBy,
      createdAt: formValue.createdAt,
      poNumber: formValue.selectedPoNumber,
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

      items: this.finalProFormaPostData.proformaItems,
      notes: formValue.notes,
      totals: {
        subTotal: subTotal,
        total: subTotal,
        currency: formValue.currencyCode,
      },
    };

    this.currentStep = 3;
  }
  public generateLoading: boolean = false;
  postInvoice() {
    this.generateLoading = true;
    this.invoiceService
      .postProFormaInvoiceData(this.finalProFormaPostData)
      .subscribe({
        next: (res) => {
          this.generateLoading = false;
          this.currentStep = 1;
          this.toastr.success('Pro Forma Invoice generated successfully.');
          this.proFormaForm.reset();
          this.itemsArray.clear();
          this.finalInvoiceData = null;
          this.getProFormaInvoicablePO();
        },
        error: (err) => {
          this.generateLoading = false;
          this.toastr.error('Error generating Pro Forma Invoice.');
        },
      });
  }
  printProForma() {
    window.print();
  }

  viewProFormaDetails(invoice: any): void {
    alert(`Viewing Pro Forma Invoice: ${invoice.proformaNumber}`);
  }

  downloadProFormaCode(invoice: any): void {
    const invoiceCode = JSON.stringify(invoice, null, 2);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceCode),
    );
    element.setAttribute('download', `proforma-${invoice.proformaNumber}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
