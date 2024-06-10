import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../../../shared/Constants';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  
  constructor(private http: HttpClient) { }

  externalLogin(request:SocialUser):Observable<any> {
return this.http.post<any>(`${Constants.baseServerUrl}/`, request, { headers: this.headers } )
  }


}
