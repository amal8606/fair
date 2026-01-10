import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PackingListService {
  constructor(private readonly http: HttpClient) {}

  public getPackingList(): Observable<any> {
    return this.http.get<any>(`${environment.api}/PackingList`);
  }
  public getPackingListById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.api}/PackingList/${id}`);
  }
  public postPackingList(pkList: any): Observable<any> {
    return this.http.post<any>(`${environment.api}/PackingList`, pkList);
  }
}
