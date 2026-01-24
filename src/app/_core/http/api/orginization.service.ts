import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class OrgainizationService {
  constructor(private readonly http: HttpClient) {}

  public getOrganization(): Observable<any> {
    return this.http.get<any>(`${environment.api}/Organization/Org`);
  }
  public postOrganization(org: any) {
    return this.http.post<any>(`${environment.api}/Organization/Org`, org);
  }

  public getOrganizationById(orgId: any): Observable<any> {
    return this.http.get<any>(`${environment.api}/Organization/Org/${orgId}`);
  }
  public updateOrganization(org: any) {
    return this.http.post<any>(
      `${environment.api}/Organization/UpdateOrg`,
      org,
    );
  }

  public addOrganizationAddress(address: any) {
    return this.http.post<any>(
      `${environment.api}/Organization/Address`,
      address,
    );
  }

  public deleteOrganization(orgId: any): Observable<any> {
    return this.http.delete<any>(`${environment.api}/Organization/${orgId}`);
  }

  public deleteOrganizationAddress(id: any): Observable<any> {
    return this.http.delete<any>(
      `${environment.api}/Organization/Address/${id}`,
    );
  }
}
