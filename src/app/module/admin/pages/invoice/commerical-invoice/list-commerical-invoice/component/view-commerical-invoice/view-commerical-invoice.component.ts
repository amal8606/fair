import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommercialInvoiceService } from '../../../../../../../../_core/http/api/commericalInvoice.service';

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
  constructor(private commercialInvoiceService: CommercialInvoiceService) {}
  @Input() public ciData: any;
  @Output() onClick = new EventEmitter();

  public finalCommercialInvoiceData: any;
  ngOnInit() {
    this.commercialInvoiceService
      .getCommercialInvoiceById(this.ciData?.commercialInvoiceId)
      .subscribe((data: any) => {
        this.ciData = data;

        this.updatingValue();
      });

    this.updatingValue();
  }
  updatingValue() {
    const items = this.ciData?.commercialInvoiceItems;
    this.finalCommercialInvoiceData = {
      sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
      sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
      sellerPhone: '727-460-6757',
      signerName: 'Tony Jospeh',
      signDate: this.ciData?.createdAt,
      commercialInvoiceNumber: this.ciData?.commercialInvoiceNumber,
      createdAt: this.ciData?.createdAt,
      poNumber: null,
      customerId: this.ciData?.customerId,
      contactName: this.ciData?.contactName,
      contactNo: this.ciData?.contactNo,
      taxId: this.ciData?.taxId,
      ein: this.ciData?.ein,
      email: 'fairmount@gmail.com',
      note: '',
      customerName: 'BlueWave Construction Supplies',
      customerAddress:
        'Plot 45 Industrial Area, Near Metro Station, Pune, Maharashtra, 411001, India',
      shipToAddress:
        'Warehouse No. 9, Hinjewadi Phase 2, Pune, Maharashtra, 411057, India',
      freightType: '',
      termsOfSale: this.ciData?.termsOfSale,
      termsOfPayment: this.ciData?.termsOfPayment,
      termsOfShipping: this.ciData?.termsOfShipping,
      modeOfTransport: 'TEST',
      finalDestination: this.ciData?.finalDestination,
      placeOfReceipt: this.ciData?.placeOfReceipt,
      currency: this.ciData?.currency,
      email2: 'fairmount@gmail.co',
      k11: 'TEST',
      noOfBoxes: 10,
      billOfLandingAwbNo: 'TEST',
      noOfPallets: 10,
      grossWeight: 10,
      marksandNumbers: 'TEST',
      items: items.map((item: any) => ({
        commercialInvoiceNumber: item.commercialInvoiceNumber,
        itemId: item.itemId,
        partNumber: item.partNumber,
        poNumber: item.poNumber,
        countryOfOrgin: item.countryOfOrgin,
        ui: item.ui,
        poId: item.poId,
        hsc: item.hsc,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totals: {
        subTotal: this.ciData?.totalAmount,
        taxableAmount: 0,
        shippingCharge: 0,
        grandTotal: this.ciData?.totalAmount,
        currency: this.ciData?.currency,
      },
    };
  }
  closeModel() {
    this.onClick.emit();
  }
}
