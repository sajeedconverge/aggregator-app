import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  headers = new HttpHeaders()
  .set('Content-Type', 'application/json')
  ;

  constructor(private http: HttpClient) { }

  getSpotifyAccessToken(body: any): Observable<any> {
    return this.http.post<any>(Constants.spotifyTokenUrl, body, { headers: Constants.spotifyHeader });
  }

  getArtists(token:string): Observable<any>{
    return this.http.get<any>(Constants.spotifyArtistsUrl, { headers: this.headers.set('Authorization',`Bearer ${token}`) });
  }

}
