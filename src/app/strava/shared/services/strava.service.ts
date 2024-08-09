import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ResponseModel } from '../../../shared/shared-models';
import { Constants } from '../../../shared/Constants';
import { PostActivityDetailRequest, PostActivityRequest } from '../models/strava-models';

@Injectable({
  providedIn: 'root'
})
export class StravaService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  accessToken = sessionStorage.getItem('strava-bearer-token');

  constructor(private http: HttpClient) { }

  //.net api calls
  getStravaAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Strava/GetStravaAuthUrl', { headers: this.headers })
  }

  getStravaData(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Strava/GetStravaData', { headers: this.headers })
  }

  getStravaAccessTokenUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Strava/GetStravaAccessTokenUrl', { headers: this.headers });
  }

  getStravaAthleteActivitiesUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Strava/GetAthleteActivitiesUrl', { headers: this.headers });
  }

  getStravaActivityDetailsUrl(activityId:number): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetActivityDetailsUrl?activityId=${activityId}`, { headers: this.headers });
  }

  getStravaActivityStreamsUrl(activityId:number): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetActivityStreamsUrl?activityId=${activityId}`, { headers: this.headers });
  }

  getStravaTokenRefreshUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetTokenRefreshUrl`, { headers: this.headers });
  }

  postActivity(request: PostActivityRequest): Observable<any> {
    return this.http.post<any>(Constants.baseServerUrl + 'Strava/PostActivity', request, { headers: this.headers });
  }

  postActivityDetail(request: PostActivityDetailRequest): Observable<any> {
    return this.http.post<any>(Constants.baseServerUrl + 'Strava/PostActivityDetail', request, { headers: this.headers });
  }

  getAllActivities():Observable<any>{
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetAllActivities`, { headers: this.headers })
    .pipe(
      map(response => {
        // Parse the jsonData property for each activity
        response.payload = response.payload.map((activity: any) => {
          // Use the conversion function to handle non-JSON compliant data
          activity.jsonData = Constants.convertToValidJson(activity.jsonData);
          return activity;
        });
        return response;
      })
    );
  }

  getAllActivityDetails():Observable<any>{
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetAllActivityDetails`, { headers: this.headers })
    .pipe(
      map(response => {
        // Parse the jsonData property for each track
        response.payload = response.payload.map((activityDetail: any) => {
          activityDetail.jsonData = Constants.convertToValidJson(activityDetail.jsonData);
          return activityDetail;
        });
        return response;
      })
    );
  }

  getActivityById(providerId:number){
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetActivityByProviderId?providerId=${providerId}`, { headers: this.headers })
    .pipe(
      map(response => {
        // Check if payload is an object and has jsonData
        if (response.payload && typeof response.payload === 'object' && response.payload.jsonData) {
          response.payload.jsonData = Constants.convertToValidJson(response.payload.jsonData);
        }
        return response;
      })
    );
  }

  getActivityDetailById(providerId:number){
    return this.http.get<any>(Constants.baseServerUrl + `Strava/GetActivityDetailByProviderId?providerId=${providerId}`, { headers: this.headers })
    .pipe(
      map(response => {
        // Check if payload is an object and has jsonData
        if (response.payload && typeof response.payload === 'object' && response.payload.jsonData) {
          response.payload.jsonData = Constants.convertToValidJson(response.payload.jsonData);
        }
        return response;
      })
    );
  }













  // third party api calls
  //token api
  generateStravaAccessToken(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body, { headers: this.headers });
  }

  //Strava common fetch api
  StravaCommonGetApi(url: string, accessToken: string): Observable<any> {
    return this.http.get<any>(url, { headers: Constants.stravaHeader.set('Authorization', `Bearer ${accessToken}`) })
  }



}
