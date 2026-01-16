import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommercialInvoiceService } from '../../../../../../../../_core/http/api/commericalInvoice.service';
import { OrgainizationService } from '../../../../../../../../_core/http/api/orginization.service';
import { PackingListService } from '../../../../../../../../_core/http/api/packingList.service';
import { SliService } from '../../../../../../../../_core/http/api/sli.service';

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
export class ViewCommericalInvoiceComponent implements OnInit {
  constructor(
    private readonly invoiceSrv: CommercialInvoiceService,
    private readonly orgainizationService: OrgainizationService,
    private readonly packingListService: PackingListService,
    private readonly sliService: SliService
  ) {}
  @Input() public ciNumber: any;
  @Output() onClick = new EventEmitter();
  selectedTabIndex = 0;
  isLoading: boolean = false;
  tabNames = [
    'COMMERCIAL INVOICE',
    'EXPORT PACKING LIST',
    "SHIPPER'S LETTER OF INSTRUCTIONS",
  ];
  public sellerDetails = {
    sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
    sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
    sellerPhone: '727-460-6757',
    sellerFax: '727-460-6758',
  };
  public finalCommercialInvoiceData: any;
  public commercialInvoiceItems: any;
  public packetListing: any;
  public sli: any;
  // public finalCommercialInvoiceData = {
  //   sellerName: 'FAIRMOUNT INTERNATIONAL LLC',
  //   sellerAddress: '11877 91st Ave, SEMINOLE, FL. 33772',
  //   sellerPhone: '727-460-6757',
  //   signerName: 'Tony Jospeh',
  //   signDate: '2025-12-20',
  //   commercialInvoiceNumber: 'CI-8754',
  //   createdAt: '2025-12-20',
  //   poNumber: null,
  //   customerId: '2',
  //   contactName: 'TEST',
  //   contactNo: '7845120963',
  //   taxId: 'TEST',
  //   ein: 'Test',
  //   email: 'fairmount@gmail.com',
  //   note: '',
  //   customerName: 'BlueWave Construction Supplies',
  //   customerAddress: 'Plot 45 Industrial Area, Near Metro Station, Pune, Maharashtra, 411001, India',
  //   shipToAddress: 'Warehouse No. 9, Hinjewadi Phase 2, Pune, Maharashtra, 411057, India',
  //   freightType: '',
  //   termsOfSale: 'TEST',
  //   termsOfPayment: 'TEST',
  //   termsOfShipping: 'TEST',
  //   modeOfTransport: 'TEST',
  //   finalDestination: 'USA',
  //   placeOfReceipt: 'TEST',
  //   currency: 'USD',
  //   email2: 'fairmount@gmail.com',
  //   k11: 'TEST',
  //   noOfBoxes: 10,
  //   billOfLandingAwbNo: 'TEST',
  //   noOfPallets: 10,
  //   grossWeight: 10,
  //   marksandNumbers: 'TEST',
  //   items: [
  //     {
  //       commercialInvoiceNumber: 'CI-8754',
  //       itemId: 36,
  //       partNumber: 'PT-784512',
  //       poNumber: 'fr-98778',
  //       countryOfOrgin: '',
  //       ui: '',
  //       poId: 10,
  //       hsc: '62034290',
  //       description: 'Test',
  //       quantity: 10,
  //       unitPrice: 1000,
  //       totalPrice: 10000,
  //     },
  //   ],
  //   totals: {
  //     subTotal: 10000,
  //     taxableAmount: 0,
  //     shippingCharge: 0,
  //     grandTotal: 10000,
  //     currency: 'USD',
  //   },
  // };
  public customerDetails: any;
  ngOnInit() {
    if (this.ciNumber) {
      this.getall();
    }
  }
  public getall() {
    this.isLoading = true;
    this.getOrganizationDetails();
    this.getInvoiceDetails();
    this.getpacketList();
    this.getSliDetails();
  }
  closeModel() {
    this.onClick.emit();
  }

  printDocument() {
    window.print();
  }
  public getOrganizationDetails() {
    this.orgainizationService
      .getOrganizationById(this.ciNumber.customerId)
      .subscribe({
        next: (orgData) => {
          this.customerDetails = orgData;
        },
      });
  }
  public getInvoiceDetails() {
    this.isLoading = true;
    this.invoiceSrv
      .getCommercialInvoiceDetails(this.ciNumber.commercialInvoiceId)
      .subscribe({
        next: (result: any) => {
          this.commercialInvoiceItems = result;
          this.finalCommercialInvoiceData = { ...result };
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
  public getpacketList() {
    this.packingListService
      .getPackingListByCommericalInvoiceId(this.ciNumber.commercialInvoiceId)
      .subscribe({
        next: (res) => {
          this.packetListing = res;
          this.finalCommercialInvoiceData = {
            ...this.finalCommercialInvoiceData,
            ...res,
          };
        },
      });
  }
  public getSliDetails() {
    this.sliService
      .getSliListCommericailById(this.ciNumber.commercialInvoiceId)
      .subscribe({
        next: (res: any) => {
          this.sli = res;
          this.finalCommercialInvoiceData = {
            ...this.finalCommercialInvoiceData,
            ...res,
          };
          this.isLoading = false;
          console.log(this.finalCommercialInvoiceData);
        },
      });
  }

  public getOrgName(orgId: any) {
    this.orgainizationService.getOrganizationById(orgId).subscribe({
      next: (orgData) => {
        return orgData.name;
      },
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
  getCurrentTabName(): string {
    return this.tabNames[this.selectedTabIndex];
  }
  public sliForm: FormGroup = new FormGroup({
    usppiNameId: new FormControl(0),
    usppiAddressId: new FormControl(0),
    flcName: new FormControl(''),
    flcAddress: new FormControl(''),
    forwardingAgent: new FormControl(''),
    usppiEin: new FormControl(''),
    relatedPartyIndicator: new FormControl(false),
    usppiReference: new FormControl(''),
    routedExportTransaction: new FormControl(false),
    ucName: new FormControl(0),
    ucAddressId: new FormControl(0),
    ucType: new FormControl(''),
    icName: new FormControl(''),
    icAddress: new FormControl(''),
    stateOfOrigin: new FormControl(''),
    countryOfUltimateDestination: new FormControl(''),
    hazardousMaterial: new FormControl(false),
    inBondCode: new FormControl(''),
    entryNumber: new FormControl(''),
    ftzIdentifier: new FormControl(''),
    tibCarnet: new FormControl(false),
    ddtcApplicantRegistrationNumber: new FormControl(''),
    eligiblePartyCertification: new FormControl(false),
    nonLicensableScheduleBHTSNumbers: new FormControl(false),
    usppiAuthorize: new FormControl(false),
    usppiEmailAddress: new FormControl(''),
    authorizedOfficerName: new FormControl(''),
    officerTitle: new FormControl(''),
    validateElectronicSignature: new FormControl(false),
    commercialInvoiceId: new FormControl(0),
    packingListId: new FormControl(0),
    createdAt: new FormControl(''),
    updatedAt: new FormControl(''),
    items: new FormArray([]),
  });
  public itemGroup(item?: any, lineNumber?: number): FormGroup {
    {
      const itemData: any = {
        itemId: item?.itemId || 0,
        df: '',
        shippingWeight: 0,
        eccnEar99Usml: '',
        sme: '',
        elNoNlr: '',
        licenseValueByItem: '',
        partNumber: item?.partNumber || '',
        description: item?.description || '',
        quantity: item?.quantity || 0,
        unitPrice: item?.unitPrice || 0,
        totalPrice: item?.totalPrice || 0,
        poId: item?.poId || 0,
        hsc: item?.hsc || '',
        ui: item?.ui || '',
      };

      return new FormGroup({
        itemId: new FormControl(itemData.itemId),
        df: new FormControl(itemData.df),
        shippingWeight: new FormControl(itemData.shippingWeight),
        eccnEar99Usml: new FormControl(itemData.eccnEar99Usml),
        sme: new FormControl(itemData.sme),
        elNoNlr: new FormControl(itemData.elNoNlr),
        licenseValueByItem: new FormControl(itemData.licenseValueByItem),
        partNumber: new FormControl(itemData.partNumber),
        description: new FormControl(itemData.description),
        quantity: new FormControl(itemData.quantity),
        unitPrice: new FormControl(itemData.unitPrice),
        totalPrice: new FormControl(itemData.totalPrice),
        poId: new FormControl(itemData.poId),
        hsc: new FormControl(itemData.hsc),
        ui: new FormControl(itemData.ui),
      });
    }
  }
  get sliItemsArray(): FormArray {
    return this.sliForm.get('items') as FormArray;
  }
}
