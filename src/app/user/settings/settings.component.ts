import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProviderTokenRequest } from '../shared/models/user-models';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';
import { AccountService } from '../shared/services/account.service';
import { Constants } from '../../shared/Constants';
import { HttpHeaders } from '@angular/common/http';
import { StravaService } from '../../strava/shared/services/strava.service';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { AuthService } from '../shared/services/auth.service';
import { Title } from '@angular/platform-browser';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSwitchModule,
    ProgressBarComponent,
    CardModule,
    ButtonModule,
    InputSwitchModule,
    InputNumberModule,

    




  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  stravaLinked: boolean = false;
  spotifyLinked: boolean = false;
  isUserLoggedIn = false;
  isLoading: boolean = false;

  constructor(
    private stravaAuthService: StravaAuthorizationService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private accountService: AccountService,
    private stravaService: StravaService,
    private spotifyService: SpotifyService,
    private authService: AuthService,
    private title: Title
  ) {
    this.title.setTitle('AudioActive - Settings')
    this.fetchThirdPartyDetails();
  }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.spotifyLinked = this.authService.isSpotifyLinked();
      this.stravaLinked = this.authService.isStravaLinked();
    };
  }

  ngDoCheck() {
    // console.log("ngDoCheck");
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.spotifyLinked = this.authService.isSpotifyLinked();
      this.stravaLinked = this.authService.isStravaLinked();
    };
  }

  //refresh third party details
  fetchThirdPartyDetails() {
    this.spotifyService.getSpotifyData().subscribe((res) => {
      if (res.statusCode === 200) {
        Constants.spotifySettings = res.payload;
        Constants.spotifyHeader = new HttpHeaders({
          //'Authorization': 'Basic ' + btoa('a3470aef0a5e4ca5bcb06600c262f026' + ':' + '25e7aab330324d8ba368c08e7b4a5800'),
          'Authorization': 'Basic ' + btoa(Constants.spotifySettings.clientId + ':' + Constants.spotifySettings.clientSecret),
          'Content-Type': 'application/x-www-form-urlencoded',
        });
      };
    });
    this.stravaService.getStravaData().subscribe((res) => {
      if (res.statusCode === 200) {
        Constants.stravaSettings = res.payload;
      }
    });
  }


  manageSpotifyAuth(status: boolean) {
    if (status) {
      this.spotifyAuthService.loginToSpotify();
    } else {
      //Code to remove spotify tokens
      var tokenRequest: ProviderTokenRequest = {
        email: sessionStorage.getItem('user-email') || '',
        provider: 'Spotify',
        token: sessionStorage.getItem('spotify-bearer-token') || ''
      }
      this.accountService.removeProviderRefreshToken(tokenRequest).subscribe((response) => {
        if (response.statusCode === 200) {
          sessionStorage.removeItem('spotify-bearer-token');
          sessionStorage.removeItem('spotify-refresh-token');
          sessionStorage.removeItem('sbt-expiry-time');
        };
      });
    };
  }


  manageStravaAuth(status: boolean) {
    if (status) {
      this.stravaAuthService.loginToStrava();
    } else {
      //Code to remove strava tokens
      var tokenRequest: ProviderTokenRequest = {
        email: sessionStorage.getItem('user-email') || '',
        provider: 'Strava',
        token: sessionStorage.getItem('strava-bearer-token') || ''
      };
      this.accountService.removeProviderRefreshToken(tokenRequest).subscribe((response) => {
        if (response.statusCode === 200) {
          sessionStorage.removeItem('strava-bearer-token');
          sessionStorage.removeItem('strava-refresh-token');
          sessionStorage.removeItem('strava-token-expiry-time');
        };
      })
    };
  }
}
