import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StravaAuthorizationService } from '../shared/services/strava-authorization.service';

@Component({
  selector: 'app-strava-consent',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule
  ],
  templateUrl: './strava-consent.component.html',
  styleUrl: './strava-consent.component.css'
})
export class StravaConsentComponent {


  constructor(
    public stravaAuthService: StravaAuthorizationService
  ) { }


  ngOnInit(): void {
    // window.addEventListener('message', this.receiveMessage.bind(this), false);
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }
  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage.bind(this), false);
  }




  //#To extract the authcode (Spotify)
  receiveMessage(event: MessageEvent) {
    // Ensure the message is from the expected origin
    if (event.origin !== 'http://localhost:4200') {
      return;
    }
    try {
      // Handle the received message (new URL)
      const newUrl = event.data;
      const urlObj = new URL(newUrl);
      // Use the new URL to extract the authorization code and get the token
      const authCode = urlObj.searchParams.get('code');
      console.log('newUrl ', newUrl)
      console.log('urlObj  ', urlObj)
      console.log('strava authCode  ', authCode)
      //this.stravaAuthService.getStravaAccessToken(authCode);
      
    } catch (error) {
      //console.error('Invalid URL received:', event.data);
    }
  }

  callStravaAuth() {
    this.stravaAuthService.loginToStrava();
  }

}
