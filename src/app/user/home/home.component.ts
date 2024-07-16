import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { TableModule } from 'primeng/table';
import { Constants } from '../../shared/Constants';
import { CommonModule, DatePipe } from '@angular/common';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { HttpHeaders } from '@angular/common/http';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    TableModule,
    DatePipe,
    ProgressBarComponent
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
  pairedTracks: any[] = [];
  showAudioFeatures: boolean = false;
  audioFeatures: any[] = [];
  isLoading: boolean = false;



  constructor(
    private stravaAuthService: StravaAuthorizationService,
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
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
    };
  }

  startCheckingToken(): void {
    this.checkInterval = setInterval(() => {
      const stravaAccessToken = localStorage.getItem('strava-bearer-token') || '';
      if (stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0) {
        this.getAthleteActivities(stravaAccessToken);
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
    this.isLoading = true;
    this.stravaService.getStravaAthleteActivitiesUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        this.stravaService.getStravaAthleteActivities(res.payload, accessToken).subscribe((res) => {
          this.athleteActivities = res;
          //to calculate activity end time
          this.athleteActivities.forEach(activity => {
            activity.end_date = Constants.getActivityEndTime(activity.start_date, activity.elapsed_time);
          });
          console.log('athlete activities', this.athleteActivities);
          this.isLoading = false;
        });
      };
    });
  }

  //#To get actvity details by Id
  getActivityDetails(activityId: number, activityTime: any) {
    this.isLoading = true;
    this.activityDetails = [];
    this.stravaService.getStravaActivityDetailsUrl(activityId).subscribe((res) => {
      if (res.statusCode === 200) {
        this.showDetails = true;
        var activityUrl = res.payload;
        //debugger;
        const stravaAccessToken = localStorage.getItem('strava-bearer-token') || '';
        const spotifyAccessToken = localStorage.getItem('spotify-bearer-token') || '';
        if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
          this.getRecentlyPlayedAudio(activityTime, activityUrl, spotifyAccessToken, stravaAccessToken);
        } else {
          this.stravaService.getStravaActivityDetails(activityUrl, stravaAccessToken).subscribe((response) => {
            response.end_date = Constants.getActivityEndTime(response.start_date, response.elapsed_time);
            this.activityDetails.push(response);
            console.log('Activity Details', this.activityDetails);
            this.pairItems(this.activityDetails, this.recentAudio);
          });
        }
      };
    })
  }

  //#To Get recently played audio and pair it with current activity
  getRecentlyPlayedAudio(activityTime: any, activityUrl: string, spotifyAccessToken: string, stravaAccessToken: string) {
    this.recentAudio = [];
    this.activityDetails = [];
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.spotifyService.getSpotifyRecentlyPlayedUrl(activityTime).subscribe((res) => {
      if (res.statusCode === 200) {
        const url = res.payload;
        // debugger;
        this.spotifyService.SpotifyCommonGetApi(url, spotifyAccessToken).subscribe((audioResponse) => {
          this.recentAudio = audioResponse.items;
          //To calculate track start time
          this.recentAudio.forEach(track => {
            track.start_time = Constants.getTrackStartTime(track.played_at, track.track.duration_ms);
          });
          console.log("this.recentAudio", this.recentAudio);

          //to pair the activity and song
          if (stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0) {
            this.stravaService.getStravaActivityDetails(activityUrl, stravaAccessToken).subscribe((response) => {
              response.end_date = Constants.getActivityEndTime(response.start_date, response.elapsed_time);
              this.activityDetails.push(response);
              console.log('Activity Details', this.activityDetails);
              this.pairItems(this.activityDetails, this.recentAudio);
            });
          };

        });

      };
    });
  }

  //To pair activity with Audio
  pairItems1(activities: any[], tracks: any[]) {
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
        track: {
          id: 0,
          name: 'No track',
        }
      };
    };
    console.log("pairedItems", pairedItems);
    this.isLoading = false;
    //  return pairedItems;
  }


  pairItems(activities: any[], tracks: any[]) {
    const result: { activity: any, tracks: any[] }[] = [];
    // debugger;
    activities.forEach(activity => {
      const activityStartDate = new Date(activity.start_date).getTime();
      const activityEndDate = new Date(activity.end_date).getTime();

      const matchedTracks = tracks.filter(track => {
        const trackStartDate = new Date(track.played_at).getTime();
        return trackStartDate >= activityStartDate && trackStartDate <= activityEndDate;
      });

      result.push({ activity, tracks: matchedTracks });
    });

    this.pairedTracks = result[0].tracks;
    if (this.pairedTracks.length === 0) {
      this.pairedTracks[0] = {
        track: {
          id: 0,
          name: 'No track',
        }
      };
    };
    console.log("pairedItems", result);
    console.log("this.pairedTracks", this.pairedTracks);

    this.isLoading = false;
    return result;
  }





  //To get audio features
  getAudioFeatures(trackId: string) {
    this.audioFeatures = [];
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
      if (res.statusCode === 200) {
        var featuresUrl = res.payload;
        const spotifyAccessToken = localStorage.getItem('spotify-bearer-token') || '';
        this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
          this.audioFeatures.push(res);
          this.showAudioFeatures = true;
        })

      }
    })
  }








}
