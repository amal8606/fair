import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { PoService } from '../../../../../_core/http/api/po.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// --- Data Structures (Interfaces) ---

export interface Customer {
  customerId: number;
  customerName: string;
  fullAddress: string;
}

export interface POSummary {
  id: number;
  poNumber: string;
  buyerOrgName: string; // Customer Name
  createdAt: string;
  poType: string;
}

// NEW INTERFACE for the individual item data fetched by getPOItems
export interface POItem {
  itemId: number;
  poId: number;
  quantity: number;
  unit: string; // Mapped to unitOfIssue
  description: string;
  manufacturerModel: string;
  partNumber: string;
  traceabilityRequired: number;
  unitPrice: number;
  totalPrice: number;
  actualCostPerUnit: number;
  statusId: number | null;
  terms: string;
  itemStatus: string | null;
}

// Interface for the full PO details (NO LONGER includes the items array)
export interface FullPO {
  id: number;
  customerId: number;
  poNumber: string;
  buyerOrgName: string;
  destination: string;
  // ... (other PO header fields)
}

export interface ProFormaData {
  invoiceNumber: string;
  date: string;
  poNumber: string;
  customerAddress: string;
  shipToAddress: string;
  freightType: string;
  estimatedShipDate: string;
  items: any[];
  totals: { subTotal: number; total: number; currency: string };
}

@Component({
  selector: 'app-pro-forma-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pro-forma-invoice.component.html',
})
export class ProFormaInvoiceComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;

  proFormaForm!: FormGroup;

  public incomingPOs: any[] = [];
  public customers: any[] = [];
  selectedPO?: FullPO; // Use the updated interface

  finalInvoiceData: any;

  // NEW: State variable to track loading status
  public isLoading: boolean = false;

  seller = {
    name: 'FAIRMOUNT INTERNATIONAL LLC',
    address: '11877 91st Ave, SEMINOLE, FL. 33772',
    phone: '727-460-6757',
    fax: '321-783-3895',
  };

  constructor(private fb: FormBuilder, private readonly poService: PoService) {}

  ngOnInit(): void {
    this.initForm();
    this.getPOs();
    this.getCustomer();
  }

  initForm(): void {
    this.proFormaForm = this.fb.group({
      selectedPoNumber: ['', Validators.required],
      invoiceDetails: this.fb.group({
        customerId: [null as number | null, Validators.required],
        invoiceNumber: [
          '',
          [Validators.required, Validators.pattern('FM-PI-\\d{4}-\\d{5}')],
        ],
        date: [
          { value: new Date().toISOString().substring(0, 10), disabled: false },
          Validators.required,
        ],
        customerAddress: ['', Validators.required],
        shipToAddress: ['', Validators.required],
        freightType: ['PICK UP', Validators.required],
        estimatedShipDate: ['N/A'],
        currency: ['USD', Validators.required],
      }),

      lineItems: this.fb.array([]),
    });
  }

  // --- Data Fetching Methods ---

  public getPOs() {
    this.poService.getActivePO().subscribe((res: POSummary[]) => {
      this.incomingPOs = res.filter(
        (po: POSummary) => po.poType === 'Incoming'
      );
    });
  }

  public getCustomer() {
    this.poService.getCustomer().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
        this.customers = this.customers.map((c) => ({
          ...c,
          fullAddress:
            c.fullAddress || `${c.customerName}'s Default Address Placeholder`,
        }));
      },
      error: (error: any) => {},
    });
  }

  // --- Form & Step Logic ---

  get itemsArray(): FormArray {
    return this.proFormaForm.get('lineItems') as FormArray;
  }

  /**
   * Fetches PO header details, updates form, then fetches PO line items,
   * populates the FormArray, and finally moves to the next step.
   * @param poId The ID of the Purchase Order to select.
   */
  selectPO(poId: number): void {
    this.isLoading = true; // START LOADING
    this.selectedPO = undefined; // Clear previous PO

    // 1. Fetch PO Header Details
    this.poService.getPO(poId).subscribe({
      next: (poDetails: any) => {
        const fullPO = poDetails as FullPO;
        this.selectedPO = fullPO;

        // Populate header and address fields
        const customerAddressPlaceholder = `${fullPO.buyerOrgName}\nDestination: ${fullPO.destination}`;
        this.proFormaForm.get('selectedPoNumber')?.setValue(fullPO.poNumber);
        this.proFormaForm.get('invoiceDetails')?.patchValue({
          customerId: fullPO.customerId || null,
          customerAddress: customerAddressPlaceholder,
          shipToAddress: customerAddressPlaceholder,
        });

        // 2. Fetch PO Line Items
        this.poService.getPO(poId).subscribe({
          next: (items: POItem[]) => {
            // 3. Populate Line Items FormArray
            this.itemsArray.clear();
            if (items && items.length > 0) {
              items.forEach((item: POItem) => {
                const extendedPrice = item.quantity * item.unitPrice;
                this.itemsArray.push(
                  this.fb.group({
                    // Mapping fields from the new POItem structure
                    partNumber: [item.partNumber],
                    description: [item.description, Validators.required],
                    quantity: [
                      item.quantity,
                      [Validators.required, Validators.min(1)],
                    ],
                    unitPrice: [
                      item.unitPrice,
                      [Validators.required, Validators.min(0)],
                    ],
                    unitOfIssue: [item.unit || 'EA'], // Use 'unit' field from POItem
                    extendedPrice: [
                      { value: extendedPrice.toFixed(2), disabled: true },
                    ],
                  })
                );
              });
            }

            // 4. Move to the next step and stop loading
            this.isLoading = false; // STOP LOADING on success
            this.nextStep();
          },
          error: (err: any) => {
            this.isLoading = false; // STOP LOADING on error
            alert(
              'Could not load PO line items. Please check the PO ID or network connection.'
            );
          },
        });
      },
      error: (err) => {
        this.isLoading = false; // STOP LOADING on error
        alert(
          'Could not load PO header details. Please check the PO ID or network connection.'
        );
      },
    });
  }

  onCustomerSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const customerId = parseInt(selectElement.value, 10);

    if (customerId) {
      const selectedCustomer = this.customers.find(
        (c) => c.customerId === customerId
      );

      if (selectedCustomer) {
        const address = selectedCustomer.fullAddress;
        this.proFormaForm.get('invoiceDetails')?.patchValue({
          customerAddress: address,
          shipToAddress: address,
        });
      }
    }
  }

  // --- (Navigation and Calculation methods remain the same) ---

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
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
    return extendedPrice;
  }

  generateInvoice(): void {
    if (this.proFormaForm.valid && this.selectedPO) {
      const formValue = this.proFormaForm.getRawValue();

      const subTotal = formValue.lineItems.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      );

      this.finalInvoiceData = {
        invoiceNumber: formValue.invoiceDetails.invoiceNumber,
        date: formValue.invoiceDetails.date,
        poNumber: this.selectedPO.poNumber,
        customerAddress: formValue.invoiceDetails.customerAddress,
        shipToAddress: formValue.invoiceDetails.shipToAddress,
        freightType: formValue.invoiceDetails.freightType,
        estimatedShipDate: formValue.invoiceDetails.estimatedShipDate,
        items: formValue.lineItems,
        totals: {
          subTotal: subTotal,
          total: subTotal,
          currency: formValue.invoiceDetails.currency,
        },
      };

      this.nextStep();
    } else {
      alert(
        'Please complete all required fields before generating the invoice.'
      );
      this.proFormaForm.markAllAsTouched();
    }
  }
}
