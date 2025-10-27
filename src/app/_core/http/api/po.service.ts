import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PoService {
  constructor(private readonly http: HttpClient) {}

  public getActivePO(): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/OrderManagement/GetActivePOS`
    );
  }

  public getPO(poId: any): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/OrderManagement/GetPOItems/${poId}`
    );
  }

  public createPO(po: any) {
    return this.http.post<any>(
      `${environment.api}/OrderManagement/CreatePO`,
      po
    );
  }
  // po items
  public createPOItem(po: any) {
    return this.http.post<any>(
      `${environment.api}/OrderManagement/AddPOItem`,
      po
    );
  }

  public createBulkPoItem(poId: any, poItem: any) {
    return this.http.post<any>(
      `${environment.api}/OrderManagement/BulkAdd?poId=${poId}`,
      poItem
    );
  }
  public updatePOItem(po: any) {
    return this.http.put<any>(
      `${environment.api}/OrderManagement/UpdatePOItem`,
      po
    );
  }

  public getCustomer(): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/OrderManagement/GetCustomers`
    );
  }
  //import po
  public importPO(po: any) {
    return this.http.post<any>(
      `${environment.api}/OrderManagement/import`,
      po,{
        reportProgress: true,
        observe: 'events'
      }
    );
  }
}
