import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Constants } from '../../../shared/Constants';
import { ResponseModel } from '../../../shared/shared-models';
import { SpotifyAuthorizationService } from './spotify-authorization.service';
import { PostTrackAnalysisRequest, PostTrackRequest, TrackMetricRequest } from '../models/spotify-models';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  // headers = new HttpHeaders().set('Content-Type', 'application/json');
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient
  ) { }

  //.net api calls
  getSpotifyAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Spotify/GetSpotifyAuthUrl', { headers: this.headers })
  }

  getSpotifyAccessTokenUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Spotify/GetSpotifyAccessTokenUrl', { headers: this.headers });
  }

  getSpotifyRecentlyPlayedUrl(activityTime: any): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetSpotifyRecentlyPlayedUrl?activityTime=${activityTime}`, { headers: this.headers });
  }

  getSpotifyData(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + 'Spotify/GetSpotifyData', { headers: this.headers });
  }

  getSpotifyAudioFeaturesUrl(trackId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetAudioFeaturesUrl?trackId=${trackId}`, { headers: this.headers });
  }

  getCurrentUserPlaylistsUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetCurrentUserPlaylistsUrl`, { headers: this.headers });
  }

  getSpotifyRecentlyPlayedLimitUrl(limit: number): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetSpotifyRecentlyPlayedFiftyUrl?limit=${limit}`, { headers: this.headers });
  }

  getSpotifyAudioAnalysisUrl(trackId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetAudioAnalysisUrl?trackId=${trackId}`, { headers: this.headers });
  }

  postTrack(request: PostTrackRequest): Observable<any> {
    return this.http.post<any>(Constants.baseServerUrl + 'Spotify/PostTrack', request, { headers: this.headers });
  }

  getTrackById(providerId: string): Observable<any> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetTrackByProviderId?providerId=${providerId}`, { headers: this.headers })
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

  getAllTracks(pageNumber:number,pageSize:number): Observable<any> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetAllTracks?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers: this.headers })
      .pipe(
        map(response => {
          // Parse the jsonData property for each track
          response.payload = response.payload.map((track: any) => {
            track.jsonData = JSON.parse(track.jsonData);
            return track;
          });
          return response;
        })
      );
  }

  getCreateNewPlaylistUrl(userId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetCreateNewPlaylistUrl?userId=${userId}`, { headers: this.headers });
  }

  getUserProfileUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetUserProfileUrl`, { headers: this.headers });
  }

  getPlaylistOpsUrl(playlistId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetPlaylistOpsUrl?playlistId=${playlistId}`, { headers: this.headers });
  }

  mapSpotifyUser(userId: string, spotifyUserId: string): Observable<ResponseModel> {
    return this.http.post<any>(Constants.baseServerUrl + `Spotify/MapSpotifyUser?userId=${userId}&spotifyUserId=${spotifyUserId}`, { headers: this.headers });
  }

  getSpotifyUser(userId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetSpotifyUser?userId=${userId}`, { headers: this.headers });
  }

  postTrackAnalysis(request: PostTrackAnalysisRequest): Observable<ResponseModel> {
    return this.http.post<any>(Constants.baseServerUrl + 'Spotify/PostTrackAnalysis', request, { headers: this.headers });
  }

  getTrackAnalysisById(providerId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetTrackAnalysisByProviderId?providerId=${providerId}`, { headers: this.headers })
      .pipe(
        map(response => {
          // Check if payload is an object and has jsonData
          if (response.payload && typeof response.payload === 'object' && response.payload.analysisJsonData) {
            response.payload.analysisJsonData = Constants.convertToValidJson(response.payload.analysisJsonData);
          }
          return response;
        })
      );
  }

  getLikedSongsUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetLikedSongsUrl`, { headers: this.headers });
  }

  getSeveralAudioFeaturesUrl(ids: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetSeveralAudioFeaturesUrl?ids=${ids}`, { headers: this.headers });
  }

  postTrackMetric(request: TrackMetricRequest): Observable<ResponseModel> {
    return this.http.post<any>(Constants.baseServerUrl + 'Spotify/PostTrackMetric', request, { headers: this.headers });
  }

  getTrackMetricsByTrackId(trackId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `Spotify/GetTrackMetricsByTrackId?trackId=${trackId}`, { headers: this.headers });
  }

  getMultipleTrackAnalysesByIds(providerIds: string[]): Observable<ResponseModel> {
    const params = new HttpParams().set('providerIds', providerIds.join(','));
    return this.http.get<any>(`${Constants.baseServerUrl}Spotify/GetTrackAnalysesByProviderIds`, {
      headers: this.headers,
      params: params
    })
      .pipe(
        map(response => {
          // Parse the jsonData property for each track
          response.payload = response.payload.map((trackAnalysis: any) => {
            trackAnalysis.analysisJsonData = JSON.parse(trackAnalysis.analysisJsonData);
            return trackAnalysis;
          });
          return response;
        })
      );
  }











  //third party api calls
  //token api
  generateSpotifyAccessToken(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body, {
      headers: Constants.spotifyHeader
    });
  }
  //fetch api
  SpotifyCommonGetApi(url: string, token: string): Observable<any> {
    return this.http.get<any>(url, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  }
  SpotifyCommonPutApi(url: string, body: any, token: string): Observable<any> {
    return this.http.put<any>(url, body, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  }
  SpotifyCommonPostApi(url: string, body: any, token: string): Observable<any> {
    return this.http.post<any>(url, body, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  }
  SpotifyCommonDeleteApi(url: string, body: any, token: string): Observable<any> {
    return this.http.delete<any>(url, {
      headers: this.headers.set('Authorization', `Bearer ${token}`),
      body: body
    });
  }


}
