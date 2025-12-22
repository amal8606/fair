import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-view-commerical-invoice',
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
  templateUrl: './view-commerical-invoice.component.html',
})
export class ViewCommericalInvoiceComponent {
  constructor() {}
  @Input() public ciNumber: any;
  @Output() onClick = new EventEmitter();

  public finalCommercialInvoiceData = {
    sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
    sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
    sellerPhone: '727-460-6757',
    signerName: 'Tony Jospeh',
    signDate: '2025-12-20',
    commercialInvoiceNumber: 'CI-8754',
    createdAt: '2025-12-20',
    poNumber: null,
    customerId: '2',
    contactName: 'TEST',
    contactNo: '7845120963',
    taxId: 'TEST',
    ein: 'Test',
    email: 'fairmount@gmail.com',
    note: '',
    customerName: 'BlueWave Construction Supplies',
    customerAddress:
      'Plot 45 Industrial Area, Near Metro Station, Pune, Maharashtra, 411001, India',
    shipToAddress:
      'Warehouse No. 9, Hinjewadi Phase 2, Pune, Maharashtra, 411057, India',
    freightType: '',
    termsOfSale: 'TEST',
    termsOfPayment: 'TEST',
    termsOfShipping: 'TEST',
    modeOfTransport: 'TEST',
    finalDestination: 'USA',
    placeOfReceipt: 'TEST',
    currency: 'USD',
    email2: 'fairmount@gmail.com',
    k11: 'TEST',
    noOfBoxes: 10,
    billOfLandingAwbNo: 'TEST',
    noOfPallets: 10,
    grossWeight: 10,
    marksandNumbers: 'TEST',
    items: [
      {
        commercialInvoiceNumber: 'CI-8754',
        itemId: 36,
        partNumber: 'PT-784512',
        poNumber: 'fr-98778',
        countryOfOrgin: '',
        ui: '',
        poId: 10,
        hsc: '62034290',
        description: 'Test',
        quantity: 10,
        unitPrice: 1000,
        totalPrice: 10000,
      },
    ],
    totals: {
      subTotal: 10000,
      taxableAmount: 0,
      shippingCharge: 0,
      grandTotal: 10000,
      currency: 'USD',
    },
  };
  closeModel() {
    this.onClick.emit();
  }
}
