import { Injectable } from '@angular/core';
import { Constants } from '../Constants';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthorizationService {

  constructor(
    private spotifyService: SpotifyService
  ) { }


  //#to open spotify login modal
  loginToSpotify() {
    var url: any;
    this.spotifyService.getSpotifyAuthUrl().subscribe((res) => {
      if (res) {
        //console.log(res);
        url = new URL(res.payload);

        // Open the URL in a new window that looks like a dialog
        const width = 500;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);

        const loginWindow = window.open(url.toString(), 'Spotify Login', `width=${width},height=${height},top=${top},left=${left}`);

        // Check the window URL periodically
        const intervalId = setInterval(() => {
          try {
            if (loginWindow && loginWindow.closed) {
              clearInterval(intervalId);
            } else if (loginWindow && loginWindow.location.href !== url.toString()) {
              // Send the new URL back to the main window
              window.postMessage(loginWindow.location.href, 'http://localhost:4200');
              loginWindow.close();
              clearInterval(intervalId);
            }
          } catch (e) {
            // Cross-origin error, wait for the same-origin response
          }
        }, 500);
      };
    });
    
  }

  //#To get access token
  getSpotifyAccessToken(authCode: any) {
    var body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', authCode);
    body.set('redirect_uri', Constants.spotifySettings.redirectClientUrl);

    this.spotifyService.getSpotifyAccessTokenUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        const tokenUrl: string = res.payload;
        this.spotifyService.generateSpotifyAccessToken(tokenUrl, body).subscribe((res) => {
          if (res) {
            console.log("new access token", res);
            sessionStorage.setItem('spotify-bearer-token', res.access_token);
            sessionStorage.setItem('spotify-refresh-token', res.refresh_token);

            const currentDateTime = new Date();
            const tokenExpiryTime = new Date(currentDateTime.getTime() + 3600 * 1000);
            console.log(currentDateTime, tokenExpiryTime);
            sessionStorage.setItem('sbt-expiry-time', tokenExpiryTime.toISOString());
          };
        })
      }
    });
  }
  //To refresh access token
  refreshSpotifyAccessToken() {
    const refreshToken: string = sessionStorage.getItem('spotify-refresh-token') || '';

    var body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
    body.set('client_id', Constants.spotifySettings.clientId);

    this.spotifyService.getSpotifyAccessTokenUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        const tokenUrl: string = res.payload;
        this.spotifyService.generateSpotifyAccessToken(tokenUrl, body).subscribe((res) => {
          if (res) {
            console.log("refresh access token", res);
            sessionStorage.setItem('spotify-bearer-token', res.access_token);

            const currentDateTime = new Date();
            const tokenExpiryTime = new Date(currentDateTime.getTime() + 3600 * 1000);
            console.log(currentDateTime, tokenExpiryTime);
            sessionStorage.setItem('sbt-expiry-time', tokenExpiryTime.toISOString());
          };
        })
      };
    });
  }
  //To check sbt expiry and refresh the access token
  checkExpiryAndRefreshToken() {
    const sbtExpiryTime = sessionStorage.getItem('sbt-expiry-time');
    if (sbtExpiryTime) {
      const futureDateTime = new Date(sbtExpiryTime);
      const currentTime = new Date();

      // Calculate the difference in milliseconds
      const timeDifference = futureDateTime.getTime() - currentTime.getTime();

      // Convert the difference to minutes
      const timeDifferenceInMinutes = timeDifference / (1000 * 60);

      // If the difference is 10 minutes or less, call refreshSpotifyAccessToken
      if (timeDifferenceInMinutes <= 10) {
        this.refreshSpotifyAccessToken();
      }
    }
  }






}
