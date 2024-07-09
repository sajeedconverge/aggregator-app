import { Injectable } from '@angular/core';
import { StravaService } from './strava.service';
import { Constants } from '../../../shared/Constants';

@Injectable({
  providedIn: 'root'
})
export class StravaAuthorizationService {

  constructor(private stravaService: StravaService) { }

  // loginToStrava() {
  //   var url: any;
  //   this.stravaService.getStravaAuthUrl().subscribe((res) => {
  //     if (res) {
  //       //console.log(res);
  //       url = new URL(res.payload);

  //       // Open the URL in a new window that looks like a dialog
  //       const width = 500;
  //       const height = 600;
  //       const left = (screen.width / 2) - (width / 2);
  //       const top = (screen.height / 2) - (height / 2);

  //       const loginWindow = window.open(url.toString(), 'Strava Login', `width=${width},height=${height},top=${top},left=${left}`);

  //       // Check the window URL periodically
  //      // const intervalId = setInterval(() => {
  //         //debugger;
  //           if (loginWindow && loginWindow.closed) {
  //             //clearInterval(intervalId);
  //           } else if (loginWindow && loginWindow.location.href !== url.toString()) {
  //             // Send the new URL back to the main window
  //             window.postMessage(loginWindow.location.href, 'http://localhost:4200');

  //             loginWindow.close();

  //             //clearInterval(intervalId);
  //           }

  //       //}, 500);
  //     };
  //   });
  // }

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
    console.log('strava url', url);
    const urlObj = new URL(url);
    // Use the new URL to extract the authorization code and get the token
    const authCode = urlObj.searchParams.get('code');
    console.log('newUrl ', url)
    console.log('urlObj  ', urlObj)
    console.log('strava authCode  ', authCode)
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
      //debugger;
      if (res.statusCode === 200) {
        const tokenUrl: string = res.payload;
        this.stravaService.generateStravaAccessToken(tokenUrl, body).subscribe((res) => {
          if (res) {
            console.log("new access token strava", res);
            // sessionStorage.setItem('spotify-bearer-token', res.access_token);
            // sessionStorage.setItem('spotify-refresh-token', res.refresh_token);

            // const currentDateTime = new Date();
            // const tokenExpiryTime = new Date(currentDateTime.getTime() + 3600 * 1000);
            // console.log(currentDateTime, tokenExpiryTime);
            // sessionStorage.setItem('sbt-expiry-time', tokenExpiryTime.toISOString());
          };
        })
      }
    });
  }










}
