import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private readonly http: HttpClient) {}

  public getProFormaInvoiceData(startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/Invoice/proforma-invoices?startDate=${startDate}&endDate=${endDate}'`
    );
  }
  public getProFormaInvoicablePO(): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/Invoice/proforma-invoiceable-pos`
    );
  }
  public postProFormaInvoiceData(proForm: any): Observable<any> {
    return this.http.post<any>(
      `${environment.api}/Invoice/proforma-invoices`,
      proForm
    );
  }
}
