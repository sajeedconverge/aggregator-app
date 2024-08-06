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
    const accessToken = sessionStorage.getItem('access-token') || '';
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  setAccessToken(token: string) {
    sessionStorage.setItem('access-token', token);
  }
  getAccessToken(): string | null {
    return sessionStorage.getItem('access-token') || '';
  }

  setUserEmail(email: string) {
    sessionStorage.setItem('user-email', email);
  }
  getUserEmail() {
    return sessionStorage.getItem('user-email') || '';
  }



  getdecodedUserToken(): string {
    const token = sessionStorage.getItem('access-token') || '';
    const decodedToken: string = this.jwtHelperService.decodeToken(token) || '';
    return decodedToken;
  }

  removeToken() {
    sessionStorage.clear();
  }

  isLoggedIn() {
    return sessionStorage.getItem("access-token") ? true : false;
  }

  isSpotifyLinked() {
    return sessionStorage.getItem("spotify-bearer-token") ? true : false;
  }
  isStravaLinked() {
    return sessionStorage.getItem("strava-bearer-token") ? true : false;
  }

  setSpotifyRefreshToken(token: string) {
    sessionStorage.setItem('spotify-refresh-token', token);
  }
  getSpotifyRefreshToken(): string | null {
    return sessionStorage.getItem('spotify-refresh-token') || '';
  }

  setStravaRefreshToken(token: string) {
    sessionStorage.setItem('strava-refresh-token', token);
  }
  getStravaRefreshToken(): string | null {
    return sessionStorage.getItem('strava-refresh-token') || '';
  }

}
