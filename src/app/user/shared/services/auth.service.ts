import { Injectable } from '@angular/core';
import { TokenCustomClaims } from '../models/common-models';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();

  constructor() { }

  

  isUserAuthorized() {
    const accessToken = localStorage.getItem('access-token') || '';
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  setAccessToken(token: string) {
    localStorage.setItem('access-token', token);

  }

  getAccessToken(): string | null {
    return localStorage.getItem('access-token') || '';

  }

  getdecodedUserToken(): string {
    const token = localStorage.getItem('access-token') || '';
    const decodedToken: string = this.jwtHelperService.decodeToken(token) || '';
    return decodedToken;
  }

  removeToken() {
    localStorage.clear();
  }

  isLoggedIn() {
    if (window.localStorage) {
      return localStorage.getItem("access-token") ? true : false
    }
    else {
      return false;
    }

  }


}
