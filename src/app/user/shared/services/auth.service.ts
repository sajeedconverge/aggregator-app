import { Injectable } from '@angular/core';
import { TokenCustomClaims } from '../models/common-models';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();

  constructor() { }

  // getLoggedInUserDetails(): TokenCustomClaims {
  //   var token = '';
  //   if (typeof window !== 'undefined' && window.sessionStorage) {
  //     token = sessionStorage.getItem('access-token') || '';
  //   } 

  //   const decodedToken: any = this.jwtHelperService.decodeToken(token);
  //   let claims: TokenCustomClaims = {
  //     userId: decodedToken?.sub,
  //     PersonName: decodedToken?.FullName,
  //     Email: decodedToken?.Email,
  //     UserType: decodedToken?.UserType,
  //     exp: decodedToken?.exp
  //   }
  //   return claims;
  // }

  isUserAuthorized() {
    const accessToken = sessionStorage.getItem('access-token') || '';
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  setAccessToken(token: string) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('access-token', token);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('access-token') || '';
    } else {
      return null;
    }
  }

  getdecodedUserToken(): string {
    const token = sessionStorage.getItem('access-token') || '';
    const decodedToken: string = this.jwtHelperService.decodeToken(token) || '';
    return decodedToken;
  }

  removeToken() {
    sessionStorage.clear();
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem("access-token") ? true : false
    } else {
      return false;
    }

  }

  //tempMethod
  isUserLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem("social-user") ? true : false
    } else {
      return false;
    }
  }


}
