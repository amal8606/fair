import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PoService } from '../../../../_core/http/api/po.service';

@Component({
  selector: 'app-create-po',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule],
  templateUrl: './create-po.component.html',
})
export class CreatePoComponent {
  constructor(
    private readonly poService: PoService // private readonly report: ReportsApiService
  ) {}
  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('paginator') paginator!: MatPaginator;

  public purchaseOrders = new MatTableDataSource<Request>();

  public sortedData = new MatTableDataSource<Request>();

  displayedColumns: string[] = [
    'select',
    'po',
    'date',
    'lin',
    'ref',
    'qunty',
    'sh',
    'bo',
    'ui',
    'manufacturer',
    'partNumber',
    'description',
    'quoteNumber',
    'vendorPo',
    'comment',
    'remarks',
    'shippingRef',
    'coo',
    'hsCord',
    'poValue',
    'epoValue',
    'cost',
    'ecost',
    'wr',
    'tracking',
    'shipToLoc',
    'ci',
    'awb',
  ];
  public response = [
    {
      po: '53304',
      date: '24-Apr',
      lin: '1',
      ref: '',
      qunty: '10',
      sh: '9+1',
      bo: '',
      ui: 'EA',
      manufacturer: 'PLAID ENTERPRISES',
      partNo: '50411',
      DESCRIPTION: `PAINT, ACRYLIC, POURING, GOLD RUSH GLITTER, 9 OZ`,
      quote: '#W026059',
      vendor_po: '',
      COMMENT: '',
      REMARKS: '',
      shippingRef: '',
      COO: '',
      hsCode: '',
      poValue: '15.60',
      epoValue: '156.00',
      COST: '7.20',
      eCost: '72.00',
      WR: '',
      TRACKING: '',
      shipToLOc: '',
      CI: 'FM-CI-04312 FM-CI-04465',
      AWB: '881173308687. 883005177883',
    },
    {
      po: '53304',
      date: '24-Apr',
      lin: '2',
      ref: '',
      qunty: '10',
      sh: '2+',
      bo: '',
      ui: 'EA',
      manufacturer: 'PLAID ENTERPRISES',
      partNo: '50413',
      description: `PAINT, ACRYLIC, POURING, COSMO SKY GLITTER, 9 OZ`,
      quote: "6300111460022640'",
      vendorPo: '',
      comment: '',
      remarks: '',
      shippingRef: '',
      coo: '',
      hsCode: '',
      poValue: '15.60',
      ePoValue: '156.00',
      cost: '9',
      eCost: '95.90',
      wr: '',
      tracking: '',
      shipToLOc: '',
      ci: 'FM-CI-04312',
      awb: '881173308687',
    },
    // ... Add the rest of the rows in the same format
  ];

  ngOnInit() {
    this.getActivePO();
  }
  public getActivePO() {
    this.poService.getActivePO().subscribe({
      next: (response) => {
        this.sortedData.data = [...response, this.response];
        this.purchaseOrders.data = [...response, this.response]; // if needed
        this.sortedData.paginator = this.paginator; // Make sure this is set
      },
    });
  }
  sortData(sort: Sort) {
    const data = this.purchaseOrders.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData.data = data;
      return;
    }
    this.sortedData.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'poNumber':
          return this.compare(a.poNumber, b.poNumber, isAsc);
        case 'customerName':
          return this.compare(a.customerName, b.customerName, isAsc);
        case 'orderDate':
          return this.compare(a.orderDate, b.orderDate, isAsc);
        case 'modeOfShipment':
          return this.compare(a.modeOfShipment, b.modeOfShipment, isAsc);
        case 'totalCost':
          return this.compare(a.totalCost, b.totalCost, isAsc);
        case 'totalAmount':
          return this.compare(a.totalAmount, b.totalAmount, isAsc);
        case 'description':
          return this.compare(a.description, b.description, isAsc);
        case 'createdBy':
          return this.compare(a.user.fullName, b.user.fullName, isAsc);
        default:
          return 0;
      }
    });
    this.sortedData.paginator = this.paginator;
  }
  public compare(a: number | string, b: number | string, isAsc: boolean) {
    if (typeof a === 'string' && typeof b === 'string') {
      // Case-insensitive string comparison
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
