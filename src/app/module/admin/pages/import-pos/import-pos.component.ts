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
      const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: true, // This converts the serial numbers to JS Date objects
        dateNF: 'yyyy-mm-dd',
      });
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
          const po = row['PoNumber'];
          if (!acc[po]) {
            acc[po] = {
              poNumber: row['PoNumber'],
              customerName: row['CustomerName'],
              orderDate: row['OrderDate'],
              deliverySchedule: row['DeliverySchedule'] || 0,
              destination: row['Destination'],
              paymentTerms: row['PaymentTerms'] || 'N/A',
              shippingCharges: row['ShippingCharges'] || 0,
              deliveryTerms: row['DeliveryTerms'] || 'N/A',
              modeOfShipment: row['ModeOfShipment'] || 'N/A',
              items: [],
            };
          }
          acc[po].items.push({
            lineNumber: row['LineNumber'],
            unit: row['Unit'],
            quantity: row['Quantity'],
            unitPrice: row['UnitPrice'],
            actualCostPerUnit: row['ActualCostPerUnit'],
            discount: row['Discount'] || 0,
            manufacturerModel: row['ManufacturerModel'],
            partNumber: row['PartNumber'],
            description: row['ItemDescription'],
            countryOfOrigin: row['CountryOfOrigin'],
            traceabilityRequired:
              row['TraceabilityRequired']?.toString().toLowerCase() === 'yes'
                ? 1
                : 0,
            hsc: row['HSC'] || 'N/A',
            weightDim: row['WeightDim'] || 'N/A',
            poNumber: row['PoNumber'],
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
    const exectedHeaders = [
      'PoNumber',
      'CustomerName',
      'OrderDate',
      'LineNumber',
      'Unit',
      'Quantity',
      'UnitPrice',
      'ActualCostPerUnit',
      'Discount',
      'ManufacturerModel',
      'PartNumber',
      'ItemDescription',
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
      // -------------------------
      // 'Supplier',
      // 'TotalPrice',
      // 'TotalAmount',
      // 'TotalCost',
      // 'Description',
      // 'CreatedBy',
    ];
    // if(!firstRow) return false;
    const fileHeaders = Object.keys(firstRow);
    return exectedHeaders.every((h) => fileHeaders.includes(h));
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
