import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../../../shared/Constants';
import { ResponseModel } from '../../../shared/shared-models';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  // headers = new HttpHeaders().set('Content-Type', 'application/json');
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  // getSpotifyAccessTokenOld(body: any): Observable<any> {
  //   return this.http.post<any>(Constants.spotifyTokenUrl, body, { headers: Constants.spotifyHeader });
  // }

  getArtists(token: string): Observable<any> {
    return this.http.get<any>(Constants.spotifyArtistsUrl, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  }

  getPlaylists(token: string): Observable<any> {
    return this.http.get<any>(Constants.spotifyPlaylistsUrl, { headers: this.headers.set('Authorization', `Bearer ${token}`) });
  }

  //.net api calls
  getSpotifyAuthUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyAuthUrl', { headers: this.headers })
  }

  getSpotifyAccessTokenUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyAccessTokenUrl', { headers: this.headers });
  }

  getSpotifyRecentlyPlayedUrl(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyRecentlyPlayedUrl', { headers: this.headers });
  }

  getSpotifyData(): Observable<ResponseModel> {
    return this.http.get<any>(Constants.baseServerUrl + '/Spotify/GetSpotifyData', { headers: this.headers });
  }










  //third party api calls
  generateSpotifyAccessToken(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body, { headers: Constants.spotifyHeader });
  }

  GetSpotifyRecentlyPlayedUrl(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body, { headers: Constants.spotifyHeader });
  }
}
