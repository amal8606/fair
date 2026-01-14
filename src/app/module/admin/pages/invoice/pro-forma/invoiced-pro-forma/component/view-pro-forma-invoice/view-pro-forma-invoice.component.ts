import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../../../../../_core/http/api/invoice.service';
import { OrgainizationService } from '../../../../../../../../_core/http/api/orginization.service';
import { PoService } from '../../../../../../../../_core/http/api/po.service';

@Component({
  selector: 'app-view-pro-forma-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-pro-forma-invoice.component.html',
})
export class ViewProFormaInvoiceComponent {
  @Input() public proformaDetails: any;
  @Output() onClick = new EventEmitter();
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orgainizationService: OrgainizationService,
    private readonly poService: PoService
  ) {}
  public sellerDetails = {
    sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
    sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
    sellerPhone: '727-460-6757',
    sellerFax: '727-460-6758',
  };
  public finalInvoiceData: any;
  public customerDetails: any;
  ngOnInit(): void {
    this.getAll();
  }
  public getAll() {
    this.getProformaDetails();
    this.orgainizationService
      .getOrganizationById(this.proformaDetails.customerId)
      .subscribe({
        next: (orgData) => {
          this.customerDetails = orgData;
        },
      });
  }

  public getProformaDetails() {
    this.invoiceService
      .getProFormaInvoiceById(this.proformaDetails.proformaId)
      .subscribe({
        next: (res) => {
          this.finalInvoiceData = res;
        },
        error: (err) => {},
      });
  }
  public getCustomerAddress(addressId: any) {
    if (!this.customerDetails?.addresses) {
      return '';
    }
    const address = this.customerDetails.addresses.find(
      (addr: any) => addr.addressId === addressId
    );

    return (
      (address?.addressLine1 ? address.addressLine1 + '\n' : '') +
      (address?.addressLine2 ? address.addressLine2 + '\n' : '') +
      (address?.city ? address.city + ', ' : '') +
      (address?.state ? address.state + ' ' : '') +
      (address?.postalCode ? address.postalCode : '')
    );
  }

  printCommercialInvoice() {
    const invoiceNumber = this.finalInvoiceData?.proformaNumber;

    if (!invoiceNumber) {
      return;
    }

    const originalTitle = document.title;
    document.title = `FM-${invoiceNumber}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  }

  closeModel() {
    this.onClick.emit();
  }
}
