import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommercialInvoiceService } from '../../../../../../_core/http/api/commericalInvoice.service';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as XLSX from 'xlsx-js-style';
@Component({
  selector: 'app-invoice-tax',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginator,
  ],
  templateUrl: './invoice-tax.component.html',
})
export class InvoiceTaxComponent {
  constructor(
    private readonly commercialInvoiceService: CommercialInvoiceService,
  ) {}
  public matHeaders: string[] = [
    'commercialInvoiceNumber',
    'createdAt',
    'pc',
    'netCost',
    'gp',
  ];

  @ViewChild('paginator') paginator!: MatPaginator;
  public loadingReport: boolean = false;
  public ciReport = new MatTableDataSource<any>();
  public sortedData = new MatTableDataSource<any>();
  public totalPC: number = 0;
  public totalNC: number = 0;
  public totalGP: number = 0;
  // format date
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  public endDate = new Date();

  public startDate = new Date(this.endDate);
  public defaultStartDate = this.startDate.setDate(this.endDate.getDate() - 7);

  public CIReport = new FormGroup({
    startDate: new FormControl(
      this.formatDate(this.startDate),
      Validators.required,
    ),
    endDate: new FormControl(
      this.formatDate(this.endDate),
      Validators.required,
    ),
  });
  ciNumber: any;
  public showModel: boolean = false;
  public tablehead: any;

  public getCIReport(): void {
    this.sortedData.data = [];
    this.loadingReport = true;
    const { startDate, endDate } = this.CIReport.value;

    this.tablehead = this.matHeaders;
    this.commercialInvoiceService.getInvoiceTax(startDate, endDate).subscribe({
      next: (result: any) => {
        const data = result;
        console.log(data);
        this.sortedData.data = data;
        this.ciReport.data = data;
        this.sortedData.paginator = this.paginator;

        this.totalPC = this.sortedData.data.reduce(
          (sum, item) =>
            sum + (item.totalAmount + item.shippingCharge + item.taxAmount),
          0,
        );
        this.totalNC = this.sortedData.data.reduce(
          (sum, item) => sum + item.netCost,
          0,
        );
        this.totalGP = this.sortedData.data.reduce(
          (sum, item) =>
            sum +
            (item.totalAmount +
              item.shippingCharge +
              item.taxAmount -
              item.netCost),
          0,
        );
      },
      error: () => {
        this.loadingReport = false;
      },
      complete: () => {
        this.loadingReport = false;
      },
    });
  }

  //   sort table headers
  sortData(sort: Sort) {
    const data = this.ciReport.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData.data = data;
      return;
    }

    this.sortedData.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'commercialInvoiceNumber':
          return this.compare(
            a.commercialInvoiceNumber,
            b.commercialInvoiceNumber,
            isAsc,
          );
        case 'date':
          return this.compare(a.createdAt, b.createdAt, isAsc);
        case 'pc':
          return this.compare(
            a.totalAmount + a.shippingCharge + a.taxAmount,
            b.totalAmount + b.shippingCharge + b.taxAmount,
            isAsc,
          );
        case 'nc':
          return this.compare(a.netCost, b.netCost, isAsc);
        case 'gp':
          return this.compare(
            a.totalAmount + a.shippingCharge + a.taxAmount - a.netCost,
            b.totalAmount + b.shippingCharge + b.taxAmount - b.netCost,
            isAsc,
          );
        default:
          return 0;
      }
    });
  }
  public compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'string' && typeof b === 'string') {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public downloadReport() {
    const exportData = this.sortedData.data.map((item: any) => ({
      'CI #': item.commercialInvoiceNumber,
      DATE: item.createdAt.split('T')[0],
      PC:
        '$' +
        (item.totalAmount + item.shippingCharge + item.taxAmount).toFixed(2),
      NC: '$' + item.netCost.toFixed(2),
      GP:
        '$' +
        (
          item.totalAmount +
          item.shippingCharge +
          item.taxAmount -
          item.netCost
        ).toFixed(2),
    }));

    // Add totals row
    exportData.push({
      'CI #': 'Total',
      DATE: '',
      PC: '$' + this.totalPC.toFixed(2),
      NC: '$' + this.totalNC.toFixed(2),
      GP: '$' + this.totalGP.toFixed(2),
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const cellStyle = {
      alignment: { horizontal: 'left' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = R === 0 ? headerStyle : cellStyle;
      }
    }

    worksheet['!cols'] = [
      { wch: 15 }, // CI #
      { wch: 12 }, // DATE
      { wch: 10 }, // PC
      { wch: 10 }, // NC
      { wch: 10 }, // GP
    ];

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Report');

    const fileName = `Invoice_Tax_Report_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}
