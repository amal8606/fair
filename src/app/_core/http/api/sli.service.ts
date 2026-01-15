import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SliService {
  constructor(private readonly http: HttpClient) {}
  public getSliList(): Observable<any> {
    return this.http.get<any>(`${environment.api}/SLI`);
  }
  public getSliListById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.api}/Sli/${id}`);
  }
  public postSliList(sliList: any): Observable<any> {
    return this.http.post<any>(`${environment.api}/Sli`, sliList);
  }
  public getSliListCommericailById(id: any): Observable<any> {
    return this.http.get<any>(`${environment.api}/Sli/commercial/${id}`);
  }
}
