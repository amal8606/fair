import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class CommercialInvoiceService {
  constructor(private readonly http: HttpClient) {}

  public getInvoicableo(): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/CommercialInvoice/eligible-pos`
    );
  }
  public getCommercialInvoicedPO(
    startDate: any,
    endDate: any
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/CommercialInvoice?startDate=${startDate}&endDate=${endDate}`
    );
  }
  public postCommercialInvoice(ciForm: any): Observable<any> {
    return this.http.post<any>(`${environment.api}/CommercialInvoice`, ciForm);
  }

    public getCommercialInvoiceDetails(
    invoiceId: number,
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/CommercialInvoice/${invoiceId}`
    );
  }
}
