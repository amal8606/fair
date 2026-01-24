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
    private readonly sliService: SliService,
  ) {}
  @Input() public ciNumber: any;
  @Output() onClick = new EventEmitter<boolean>();
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

          // Populate form controls
          this.sliForm.controls['relatedPartyIndicator'].setValue(
            res.relatedPartyIndicator,
          );
          this.sliForm.controls['routedExportTransaction'].setValue(
            res.routedExportTransaction,
          );
          this.sliForm.controls['ucType'].setValue(res.ucType);
          this.sliForm.controls['hazardousMaterial'].setValue(
            res.hazardousMaterial,
          );
          this.sliForm.controls['tibCarnet'].setValue(res.tibCarnet);
          this.sliForm.controls['eligiblePartyCertification'].setValue(
            res.eligiblePartyCertification,
          );
          this.sliForm.controls['nonLicensableScheduleBHTSNumbers'].setValue(
            res.nonLicensableScheduleBHTSNumbers,
          );
          this.sliForm.controls['usppiAuthorize'].setValue(res.usppiAuthorize);
          this.sliForm.controls['validateElectronicSignature'].setValue(
            res.validateElectronicSignature,
          );

          // Populate items FormArray
          const itemsArray = this.sliForm.get('items') as FormArray;
          itemsArray.clear();
          if (res.items && res.items.length > 0) {
            res.items.forEach((item: any) => {
              itemsArray.push(this.itemGroup(item));
            });
          }

          this.isLoading = false;
        },
      });
  }

  public getOrgName(orgId: any) {
    if (orgId) {
      this.orgainizationService.getOrganizationById(orgId).subscribe({
        next: (orgData) => {
          return orgData.name;
        },
      });
    }
  }
  public getCustomerAddress(addressId: any) {
    if (!this.customerDetails?.addresses) {
      return '';
    }
    const address = this.customerDetails.addresses.find(
      (addr: any) => addr.addressId === addressId,
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
        unit: item?.unit || '',
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
        unit: new FormControl(itemData.unit),
      });
    }
  }
  get sliItemsArray(): FormArray {
    return this.sliForm.get('items') as FormArray;
  }

  public deleteInvoiceButton: boolean = false;
  public isDeleting: boolean = false;
  public deleteInvoice() {
    //     this.invoiceSrv.deleteInvoice(this.ciNumber.commercialInvoiceId,this.ciNumber.).subscribe({
    //       next:(res)=>{
    // this.isDeleting=false
    // this.deleteInvoiceButton=false
    //     this.onClick.emit(true);
    //       }
    //     })
  }
}
