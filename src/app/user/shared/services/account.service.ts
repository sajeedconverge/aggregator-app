import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../../../shared/Constants';
import { ProviderTokenRequest, UserLoginRequest, UserRegisterRequest } from '../models/user-models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  externalLogin(request: SocialUser): Observable<any> {
    return this.http.post<any>(`${Constants.baseServerUrl}Account/external-login`, request, { headers: this.headers });
  }

  login(request:UserLoginRequest): Observable<any> {
    return this.http.post<any>(`${Constants.baseServerUrl}Account/login`, request, { headers: this.headers });
  }

  register(request:UserRegisterRequest): Observable<any> {
    return this.http.post<any>(`${Constants.baseServerUrl}Account/Register`, request, { headers: this.headers });
  }

  storeProviderRefreshToken(request: ProviderTokenRequest): Observable<any>{
    return this.http.put<any>(`${Constants.baseServerUrl}Account/StoreProviderToken`, request, { headers: this.headers });
  }

  removeProviderRefreshToken(request: ProviderTokenRequest): Observable<any>{
    return this.http.put<any>(`${Constants.baseServerUrl}Account/RemoveProviderToken`, request, { headers: this.headers });
  }

}
