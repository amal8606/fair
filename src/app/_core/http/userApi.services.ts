import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";

@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    constructor(private readonly http: HttpClient) {}
    
      public login(data:any): Observable<any> {
        return this.http.post<any>(
          `${environment.api}/UserManagement/login`,data
        );
      }
}