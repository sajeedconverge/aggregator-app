import { Injectable } from '@angular/core';
import { StravaService } from './strava.service';
import { Constants } from '../../../shared/Constants';

@Injectable({
  providedIn: 'root'
})
export class StravaAuthorizationService {

  constructor(private stravaService: StravaService) { }

  loginToStrava() {
    var url: any;
    this.stravaService.getStravaAuthUrl().subscribe((res) => {
      if (res) {
        url = new URL(res.payload);

        const stravaWindow = window.open(url, '_blank', 'width=600,height=600');
        if (!stravaWindow) {
          console.error('Failed to open the window');
          return;
        }

        const interval = setInterval(() => {
          try {
            if (stravaWindow.location.href.includes(Constants.stravaSettings.redirectClientUrl)) {
              clearInterval(interval);
              const redirectedUrl = stravaWindow.location.href;
              stravaWindow.close();
              this.extractStravaCode(redirectedUrl);
            }
          } catch (error) {
            // Error is expected due to cross-origin policies when accessing the window.location.href
          }
        }, 1000);

      };
    });
  }


  extractStravaCode(url: string) {
    const urlObj = new URL(url);
    // Use the new URL to extract the authorization code and get the token
    const authCode = urlObj.searchParams.get('code');
    this.getStravaAccessToken(authCode);
  }

  //#To get Strava accessToken
  getStravaAccessToken(authCode: any) {
    const body: any = {
      client_id: Constants.stravaSettings.clientId,
      client_secret: Constants.stravaSettings.clientSecret,
      code: authCode,
      grant_type: 'authorization_code'
    }
    this.stravaService.getStravaAccessTokenUrl().subscribe((res) => {

      if (res.statusCode === 200) {
        const tokenUrl: string = res.payload;
        this.stravaService.generateStravaAccessToken(tokenUrl, body).subscribe((res) => {
          if (res) {
            console.log("new access token strava", res);
            sessionStorage.setItem('strava-bearer-token', res.access_token);
            sessionStorage.setItem('strava-refresh-token', res.refresh_token);
            const tokenExpiryTime = new Date(res.expires_at * 1000);
            sessionStorage.setItem('strava-token-expiry-time', tokenExpiryTime.toString());

            Constants.stravaHeader.set('Authorization',res.access_token);
          };
        })
      }
    });
  }










}
