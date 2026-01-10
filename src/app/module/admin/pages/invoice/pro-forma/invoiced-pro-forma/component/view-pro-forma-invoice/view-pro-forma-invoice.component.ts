import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-pro-forma-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-pro-forma-invoice.component.html',
})
export class ViewProFormaInvoiceComponent {
  @Output() onClick = new EventEmitter();
  public finalInvoiceData = {
    sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
    sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
    sellerPhone: '727-460-6757',
    signerName: 'Tony Jospeh',
    signDate: '2026-01-05',
    invoiceNumber: 'Test',
    date: '2026-01-05',
    poNumber: 'PO-741',
    sellerFax: '727-460-6758',
    customerId: 1,
    customerName: 'Fairmount international LLC',
    customerPhone: '+91-9876543210',
    customerAddress:
      '12 MG Road, Opposite Forum Mall, Bengaluru, Karnataka, 560001, India',
    shipToAddress:
      'Unit 5, Whitefield Tech Park, Bengaluru, Karnataka, 560066, India',
    freightType: 'PICK UP',
    estimatedShipDate: '2026-01-10',
    items: [
      {
        itemId: 32,
        quantity: 10,
        unit: '4',
        description: 'Test',
        manufacturerModel: 'MM-525',
        partNumber: 'PT-855',
        traceabilityRequired: 1,
        unitPrice: 10,
        totalPrice: 100,
        actualCostPerUnit: 5,
        statusId: 0,
        ui: 'Test',
        terms: 'Test',
      },
    ],
    notes: '',
    totals: { subTotal: 100, total: 100, currency: 'USD' },
  };
  closeModel() {
    this.onClick.emit();
  }
}
