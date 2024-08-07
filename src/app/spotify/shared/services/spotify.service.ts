import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../../../shared/Constants';
import { ResponseModel } from '../../../shared/shared-models';
import { SpotifyAuthorizationService } from './spotify-authorization.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  // headers = new HttpHeaders().set('Content-Type', 'application/json');
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient
  ) { }

  // getSpotifyAccessTokenOld(body: any): Observable<any> {
  //   return this.http.post<any>(Constants.spotifyTokenUrl, body, { headers: Constants.spotifyHeader });
  // }

  // getArtists(token: string): Observable<any> {
  //   return this.http.get<any>(Constants.spotifyArtistsUrl, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  // }

  // getPlaylists(token: string): Observable<any> {
  //   return this.http.get<any>(Constants.spotifyPlaylistsUrl, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  // }

  //.net api calls
  getSpotifyAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyAuthUrl', { headers: this.headers })
  }

  getSpotifyAccessTokenUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyAccessTokenUrl', { headers: this.headers });
  }

  getSpotifyRecentlyPlayedUrl(activityTime: any): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `/Spotify/GetSpotifyRecentlyPlayedUrl?activityTime=${activityTime}`, { headers: this.headers });
  }

  getSpotifyData(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyData', { headers: this.headers });
  }

  getSpotifyAudioFeaturesUrl(trackId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `/Spotify/GetAudioFeaturesUrl?trackId=${trackId}`, { headers: this.headers });
  }

  getCurrentUserPlaylistsUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `/Spotify/GetCurrentUserPlaylistsUrl`, { headers: this.headers });
  }

  GetSpotifyRecentlyPlayedFiftyUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `/Spotify/GetSpotifyRecentlyPlayedFiftyUrl`, { headers: this.headers });
  }

  getSpotifyAudioAnalysisUrl(trackId: string): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + `/Spotify/GetAudioAnalysisUrl?trackId=${trackId}`, { headers: this.headers });
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



}
