import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from './shared/services/theme.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './user/shared/services/auth.service';
import { SigninComponent } from './user/signin/signin.component';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { StravaAuthorizationService } from './strava/shared/services/strava-authorization.service';
import { SpotifyAuthorizationService } from './spotify/shared/services/spotify-authorization.service';
import { ProviderTokenRequest } from './user/shared/models/user-models';
import { AccountService } from './user/shared/services/account.service';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { Constants } from './shared/Constants';
import { HttpHeaders } from '@angular/common/http';
import { StravaService } from './strava/shared/services/strava.service';
import { SpotifyService } from './spotify/shared/services/spotify.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    SidebarModule,
    ToastModule,
    TooltipModule,
    InputSwitchModule,
    FormsModule,
    ReactiveFormsModule,
    SigninComponent,
    RippleModule,
    StyleClassModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isIframe = false;
  isUserLoggedIn = false;
  private readonly _destroying$ = new Subject<void>();
  sidebarVisible: boolean = false;
  userName: string = "";
  stravaLinked: boolean = false;
  spotifyLinked: boolean = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private stravaAuthService: StravaAuthorizationService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private accountService: AccountService,
    private stravaService: StravaService,
    private spotifyService: SpotifyService,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.spotifyLinked = this.authService.isSpotifyLinked();
      this.stravaLinked = this.authService.isStravaLinked();
    };
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  ngDoCheck() {
    // console.log("ngDoCheck");
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.spotifyLinked = this.authService.isSpotifyLinked();
      this.stravaLinked = this.authService.isStravaLinked();
    };
  }

  get dark() {
    return this.themeService.theme === 'dark';
  }

  set dark(enabled: boolean) {
    this.themeService.theme = enabled ? 'dark' : '';
  }

  navigateToPath(path: string) {
    this.sidebarVisible = false;
    this.router.navigate([`${path}`]);

  }

  logout() {
    this.isUserLoggedIn = false;
    this.socialAuthService.signOut(true);
    sessionStorage.clear();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 500);

  }

  manageSpotifyAuth(status: boolean) {
    this.sidebarVisible = false;
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
    this.sidebarVisible = false;
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
