import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ProgressBarMode,
  MatProgressBarModule,
} from '@angular/material/progress-bar';
import { PoService } from '../../../../_core/http/api/po.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-pos',
  templateUrl: './import-pos.component.html',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
})
export class ImportPosComponent {
  private readonly requiredHeaders = [
    'PoNumber',
    'OrderDate',
    'LineNumber',
    'Quantity',
    'Unit',
    'ItemDescription',
    'ManufacturerModel',
    'PartNumber',
    'UnitPrice',
    'CustomerName',
    'ActualCostPerUnit',
    'Discount',
    'DeliverySchedule',
    'Destination',
    'CountryOfOrigin',
    'TraceabilityRequired',
    'HSC',
    'WeightDim',
    'PaymentTerms',
    'ShippingCharges',
    'DeliveryTerms',
    'ModeOfShipment',
  ];

  groupedData: any[] = [];
  responseData: any[] = [];
  uploadStatus: string | null = null;
  buttonActive: boolean = false;
  enableUpload: boolean = true;
  selectedPo: any = null;
  isUploading = false;
  errorMessage: string | null = null;
  selectedFileName: string | null = null;
  constructor(
    private readonly poApiService: PoService,
    private readonly toaster: ToastrService,
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.errorMessage = null;
    this.selectedFileName = null;
    if (!file) return;
    // ✅ Validate file type
    if (!file.name.endsWith('.xlsx')) {
      this.errorMessage = 'Invalid file type. Only XLSX files are allowed.';
      return;
    }

    // ✅ Simulate upload progress
    this.isUploading = true;
    this.uploadStatus = 'Processing...';

    // Example: Simulate upload complete
    setTimeout(() => {
      this.isUploading = false;
      this.selectedFileName = file.name;
      this.buttonActive = true;
    }, 3000);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (!this.validateHeaders(records[0])) {
        this.errorMessage =
          '❌ Invalid file format. Please use the official Purchase Order Import template.';
        this.groupedData = [];
        this.selectedFileName = null;
        this.buttonActive = false;
        return;
      }
      // Group by PoNumber
      this.groupedData = Object.values(
        (records as any[]).reduce((acc: any, row: any) => {
          const po = this.toText(row['PoNumber']);
          if (!po) return acc;

          if (!acc[po]) {
            acc[po] = {
              poNumber: po,
              customerName: this.toText(row['CustomerName']),
              destination: this.toText(row['Destination']),
              deliveryTerms: this.toText(row['DeliveryTerms']),
              paymentTerms: this.toText(row['PaymentTerms']),
              shippingCharges: this.toNumber(row['ShippingCharges']),
              discount: this.toNumber(row['Discount']),
              modeOfShipment: this.toText(row['ModeOfShipment']),
              deliverySchedule: this.toText(row['DeliverySchedule']),
              supplier: this.toText(row['Supplier']),
              orderDate: this.toDateText(row['OrderDate']),
              totalAmount: this.toNumber(row['TotalAmount']),
              totalCost: this.toNumber(row['TotalCost']),
              description: this.toText(row['Description']),
              items: [],
            };
          }
          const quantity = this.toNumber(row['Quantity']);
          const unitPrice = this.toNumber(row['UnitPrice']);
          acc[po].items.push({
            quantity,
            unit: this.toText(row['Unit']),
            description: this.toText(row['ItemDescription']),
            partNumber: this.toText(row['PartNumber']),
            manufacturerModel: this.toText(row['ManufacturerModel']),
            unitPrice,
            actualCostPerUnit: this.toNumber(row['ActualCostPerUnit']),
            traceabilityRequired: this.toNumber(row['TraceabilityRequired']),
            countryOfOrigin: this.toText(row['CountryOfOrigin']),
            hsc: this.toText(row['HSC']),
            weightDim: this.toText(row['WeightDim']),
            poNumber: po,
            lineNumber: this.toNumber(row['LineNumber']),
            totalPrice: this.toNumber(row['TotalPrice'], quantity * unitPrice),
          });
          return acc;
        }, {}),
      );
    };

    reader.readAsArrayBuffer(file);
  }
  public selectPo(po: any) {
    this.selectedPo = po;
  }
  // validate that the uploaded file has all expected headers
  validateHeaders(firstRow: any): boolean {
    if (!firstRow) return false;

    const fileHeaders = Object.keys(firstRow)
      .map((header) => header.trim())
      .filter((header) => header && !header.startsWith('__EMPTY'));

    console.log('Validating headers:', fileHeaders);

    return this.requiredHeaders.every((header) => fileHeaders.includes(header));
  }

  private toNumber(value: any, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toText(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private toDateText(value: any): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'number') {
      const parsedDate = XLSX.SSF.parse_date_code(value);
      if (parsedDate) {
        const month = String(parsedDate.m).padStart(2, '0');
        const day = String(parsedDate.d).padStart(2, '0');
        return `${parsedDate.y}-${month}-${day}`;
      }
    }

    return this.toText(value);
  }

  importData() {
    this.buttonActive = true;
    this.enableUpload = false;
    this.isUploading = true;
    this.uploadStatus = `Uploading...`;
    this.poApiService.importPO(this.groupedData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadStatus = `Uploading... ${Math.round((event.loaded / event.total) * 100)}%`;
        } else if (event.type === HttpEventType.Response) {
          this.responseData = event.body;
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.buttonActive = false;
        this.enableUpload = true;
        this.toaster.error('Failed to import Purchase Orders', 'Error');
        this.uploadStatus = '❌ Import failed. Please try again.';
      },
      complete: () => {
        this.isUploading = false;
        this.buttonActive = false;
        this.enableUpload = true;
        this.uploadStatus = '✅ Import successful!';
        this.toaster.success(
          'Purchase Orders imported successfully!',
          'Success',
        );
        this.selectedFileName = null;
        this.groupedData = [];
      },
    });
  }
}
