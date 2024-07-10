import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../shared/shared-models';
import { Constants } from '../../../shared/Constants';

@Injectable({
  providedIn: 'root'
})
export class StravaService {
  stravaAccessToken: string = sessionStorage.getItem('strava-bearer-token') || '';

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  stravaHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('authorization', `Bearer ${this.stravaAccessToken}`);

  constructor(private http: HttpClient) { }

  //.net api calls
  getStravaAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Strava/GetStravaAuthUrl', { headers: this.headers })
  }

  getStravaData(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Strava/GetStravaData', { headers: this.headers })
  }

  getStravaAccessTokenUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Strava/GetStravaAccessTokenUrl', { headers: this.headers });
  }

  getStravaAthleteActivitiesUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Strava/GetAthleteActivitiesUrl', { headers: this.headers });
  }

  // third party api calls
  generateStravaAccessToken(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body, { headers: this.headers });
  }

  getStravaAthleteActivities(url: string): Observable<any> {
    return this.http.get<any>(url, { headers: this.stravaHeaders })
  }


}
