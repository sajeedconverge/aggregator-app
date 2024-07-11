import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { SpotifyConsentComponent } from '../../spotify/spotify-consent/spotify-consent.component';
import { StravaConsentComponent } from '../../strava/strava-consent/strava-consent.component';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    SpotifyConsentComponent,
    StravaConsentComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {


  constructor(
    public stravaAuthService: StravaAuthorizationService,
    public spotifyAuthService: SpotifyAuthorizationService,
  ) { }

  callSpotifyAuth() {
    this.spotifyAuthService.loginToSpotify();
  }

  callStravaAuth() {
    this.stravaAuthService.loginToStrava();
  }







}
