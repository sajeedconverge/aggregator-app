import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../../shared/shared-models';
import { Constants } from '../../../shared/Constants';

@Injectable({
  providedIn: 'root'
})
export class StravaService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  //.net api calls
  getStravaAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Strava/GetStravaAuthUrl', { headers: this.headers })
  }






}
