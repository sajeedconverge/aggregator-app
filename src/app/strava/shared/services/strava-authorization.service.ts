import { Injectable } from '@angular/core';
import { StravaService } from './strava.service';

@Injectable({
  providedIn: 'root'
})
export class StravaAuthorizationService {

  constructor(private stravaService: StravaService) { }

  loginToStrava() {
    var url: any;
    this.stravaService.getStravaAuthUrl().subscribe((res) => {
      if (res) {
        //console.log(res);
        url = new URL(res.payload);

        // Open the URL in a new window that looks like a dialog
        const width = 500;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);

        const loginWindow = window.open(url.toString(), 'Strava Login', `width=${width},height=${height},top=${top},left=${left}`);

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
}
