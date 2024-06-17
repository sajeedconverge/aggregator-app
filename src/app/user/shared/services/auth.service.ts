import { Injectable } from '@angular/core';
import { TokenCustomClaims } from '../models/common-models';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();

  constructor() { }

  getLoggedInUserDetails(): TokenCustomClaims {
    const token = sessionStorage.getItem('access-token') || '';
    const decodedToken: any = this.jwtHelperService.decodeToken(token);
    let claims: TokenCustomClaims = {
      userId: decodedToken?.sub,
      PersonName: decodedToken?.FullName,
      Email: decodedToken?.Email,
      UserType: decodedToken?.UserType,
      exp: decodedToken?.exp
    }
    return claims;
  }

  isUserAuthorized() {
    const accessToken = sessionStorage.getItem('access-token') || '';
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  getUserToken(): string {
    const token = sessionStorage.getItem('access-token') || '';
    const decodedToken: string = this.jwtHelperService.decodeToken(token) || '';
    return decodedToken;
  }

  removeToken() {
    sessionStorage.clear();
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem("access-token") ? true : false
  }

  //tempMethod
  isUserLoggedIn(): boolean {
    return sessionStorage.getItem("social-user") ? true : false
  }
  

}
