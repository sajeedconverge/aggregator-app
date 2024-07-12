import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { SpotifyConsentComponent } from '../../spotify/spotify-consent/spotify-consent.component';
import { StravaConsentComponent } from '../../strava/strava-consent/strava-consent.component';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { TableModule } from 'primeng/table';
import { Constants } from '../../shared/Constants';
import { CommonModule, DatePipe } from '@angular/common';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    SpotifyConsentComponent,
    StravaConsentComponent,
    TableModule,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  athleteActivities: any[] = [];
  activityDetails: any[] = [];
  checkInterval: any;
  showDetails: boolean = false;
  recentAudio: any[] = [];
  pairedTrack: any;
  showAudioFeatures: boolean = false;
  audioFeatures: any[] = [];



  constructor(
    private stravaAuthService: StravaAuthorizationService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private stravaService: StravaService,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit(): void {
    this.startCheckingToken();
    this.fetchThirdPartyDetails();

  }

  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

  }

  startCheckingToken(): void {
    this.checkInterval = setInterval(() => {
      const stravaAccessToken = localStorage.getItem('strava-bearer-token') || '';
      const spotifyAccessToken = localStorage.getItem('spotify-bearer-token') || '';
      if (
        stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0 &&
        spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0
      ) {
        this.getAthleteActivities(stravaAccessToken);
        this.getRecentlyPlayedAudio(spotifyAccessToken);
        clearInterval(this.checkInterval); // Stop the interval
      };
    }, 2000); // Check every 2 seconds, adjust as needed
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

  callSpotifyAuth() {
    this.spotifyAuthService.loginToSpotify();
  }

  callStravaAuth() {
    this.stravaAuthService.loginToStrava();
  }


  getAthleteActivities(accessToken: string) {
    this.stravaService.getStravaAthleteActivitiesUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        this.stravaService.getStravaAthleteActivities(res.payload, accessToken).subscribe((res) => {
          this.athleteActivities = res;
          console.log('athlete activities', this.athleteActivities);

        });
      };
    });
  }

  //#To get actvity details by Id
  getActivityDetails(activityId: number) {
    this.activityDetails = [];
    this.stravaService.getStravaActivityDetailsUrl(activityId).subscribe((res) => {
      if (res.statusCode === 200) {
        this.showDetails = true;
        var activityUrl = res.payload;
        const accessToken = localStorage.getItem('strava-bearer-token') || '';
        if (accessToken.length > 0 && Constants.stravaSettings.clientId !== 0) {
          this.stravaService.getStravaActivityDetails(activityUrl, accessToken).subscribe((res) => {
            this.activityDetails.push(res);
            console.log('Activity Details', this.activityDetails);
            this.pairItems(this.activityDetails, this.recentAudio);
          });
        };
      };
    })
  }

  //#To Get recently played audio
  getRecentlyPlayedAudio(token: string) {
    this.recentAudio = [];
    this.spotifyService.getSpotifyRecentlyPlayedUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        const url = res.payload;

        this.spotifyService.getSpotifyRecentlyPlayed(url, token).subscribe((res) => {
          this.recentAudio = res.items;
          console.log("this.recentAudio", this.recentAudio);

        });

      };
    });
  }

  //To pair activity with Audio
  pairItems(activities: any[], tracks: any[]) {
    const pairedItems: any[] = [];
    activities.forEach(activity => {
      const activityTime = new Date(activity.start_date).getTime();

      tracks.forEach(track => {
        const trackTime = new Date(track.played_at).getTime();

        if (Math.abs(activityTime - trackTime) <= 1 * 60 * 1000) { // 2-minute window
          pairedItems.push({ activity, track });
          this.pairedTrack = track;
        }
      });
    });
    if (pairedItems.length === 0) {
      this.pairedTrack = {
        track:{
          id:0,
          name: 'No track',
        }
      };
    };
    console.log("pairedItems", pairedItems);

    //  return pairedItems;
  }

  //To get audio features
  getAudioFeatures(trackId: string) {
    this.audioFeatures = [];
    this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
      if (res.statusCode === 200) {
        var featuresUrl = res.payload;
        const spotifyAccessToken = localStorage.getItem('spotify-bearer-token') || '';
        this.spotifyService.getSpotifyAudioFeatures(featuresUrl, spotifyAccessToken).subscribe((res) => {
          this.audioFeatures.push(res);
          this.showAudioFeatures = true;
        })

      }
    })
  }








}
