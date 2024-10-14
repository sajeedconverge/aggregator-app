import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { AuthService } from '../../user/shared/services/auth.service';
import { StravaService } from '../shared/services/strava.service';
import { Router } from '@angular/router';
import { Constants } from '../../shared/Constants';
import { HttpHeaders } from '@angular/common/http';
import { PostActivityRequest } from '../shared/models/strava-models';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    TableModule,
    DatePipe,
    ProgressBarComponent,
    MessagesModule,
    ToastModule,
    BadgeModule,
    TooltipModule,
    RoundPipe,
  ],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css',
  providers: [MessageService]
})

export class ActivitiesComponent implements OnInit {
  messages: Message[] = [
    { severity: 'warn', detail: 'Strava or Spotify not linked. Please, link them first.' },
  ];
  isStravaLinked: boolean = true;
  isLoading: boolean = false;
  isADSaved: boolean = false;
  athleteActivities: any[] = [];
  nonFilteredActivities: any[] = [];
  checkInterval: any;
  recentlyPlayedFifty: any[] = [];
  stravaAccessToken: string = '';
  spotifyAccessToken: string = '';
  recentAudio: any[] = [];
























  constructor(
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private spotifyService: SpotifyService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService,
    private messageService: MessageService,
    private title: Title,
    private router: Router
  ) {
    this.title.setTitle('AudioActive - Activities');
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.primengConfig.ripple = true;
    this.fetchActivitiesFromDb();
    this.fetchThirdPartyDetails();
  }

  ngOnInit(): void {

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

  getAthleteActivities(accessToken: string) {
    this.isLoading = true;
    if (this.athleteActivities.length > 0) {
      var latestActivityTime = this.athleteActivities[0].start_date;
    };
    this.stravaService.getStravaAthleteActivitiesUrl(latestActivityTime).subscribe((resp) => {
      if (resp.statusCode === 200) {
        this.stravaService.StravaCommonGetApi(resp.payload, accessToken).subscribe((res) => {
          //this.athleteActivities = res;
          this.nonFilteredActivities = res;
          //To get fifty recently played songs
          this.spotifyService.getSpotifyRecentlyPlayedLimitUrl(50).subscribe((response) => {
            if (response.statusCode === 200) {
              this.spotifyService.SpotifyCommonGetApi(response.payload, this.spotifyAccessToken).subscribe((res) => {
                if (res.items.length > 0) {
                  this.recentlyPlayedFifty = res.items;
                  this.recentlyPlayedFifty.forEach(track => {
                    track.start_time = Constants.getTrackStartTime(track.played_at, track.track.duration_ms);
                  });
                  //debugger;
                  //to calculate activity end time
                  this.nonFilteredActivities.forEach(activity => {
                    activity.end_date = Constants.getActivityEndTime(activity.start_date, activity.elapsed_time);

                    activity.audio = Constants.assignRecentAudioToActivity(activity, this.recentlyPlayedFifty);
                    //activity duration formatted to minutes
                    activity.duration_mins = Constants.formatDuration(activity.elapsed_time * 1000); // multiplied with 1000 to convert sec to ms 
                    //activity distance converted from meters to km
                    activity.distance_km = (activity.distance / 1000);


                    if (activity.distance > 0 && activity.audio.length > 0) {

                      this.athleteActivities.push(activity);
                    };

                  });
                  console.log('athlete activities', this.athleteActivities);
                  this.isLoading = false;
                  //Code to store these activities into the DB
                  this.athleteActivities.forEach((activity) => {
                    const activityJsonObject = Constants.typeCastActivityJson(activity);
                    var activityRequest: PostActivityRequest = {
                      userEmail: this.authService.getUserEmail(),
                      providerActivityId: activity.id,
                      jsonData: JSON.stringify(activityJsonObject)
                    };
                    this.stravaService.postActivity(activityRequest).subscribe((response) => {
                      if (response.statusCode === 200) {
                        console.log("activity stored in db");
                      };
                    });
                  });
                  this.athleteActivities.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
                };
              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.isLoading = false;
              });
            };
          })
        });
      };
    });
  }

  startCheckingToken(): void {
    this.checkInterval = setInterval(() => {
      this.stravaAccessToken = sessionStorage.getItem('strava-bearer-token') || '';
      this.spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';

      if (
        this.stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0 &&
        this.spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0
      ) {
        this.getAthleteActivities(this.stravaAccessToken);
        clearInterval(this.checkInterval); // Stop the interval
        this.isStravaLinked = true;
      } else {
        this.isStravaLinked = false;
      };
    }, 2000); // Check every 2 seconds, adjust as needed
  }

  fetchActivitiesFromDb() {
    this.isADSaved = false;

    this.isLoading = true;
    var unfilteredActivites: any[] = [];
    setTimeout(() => {
      this.stravaService.getAllActivities().subscribe((actResponse) => {
        if (actResponse.statusCode === 200) {
          this.isLoading = true;
          actResponse.payload.forEach((activity: any) => {
            activity.jsonData.isSaved = true; //Boolean value to differenciate that it is from db
            unfilteredActivites.push(activity.jsonData)
          });
          unfilteredActivites.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
          //console.log(actResponse);
          // let lastActivityTime = unfilteredActivites[(unfilteredActivites.length) - 1].start_date;
          this.spotifyService.getSpotifyRecentlyPlayedLimitUrl(50).subscribe((rpRes) => {
            if (rpRes.statusCode === 200) {
              this.isLoading = true;
              var recentlyPlayedUrl = rpRes.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(recentlyPlayedUrl, spotifyAccessToken).subscribe((audioResponse) => {
                this.recentAudio = audioResponse.items;
                //To calculate track start time
                this.recentAudio.forEach(track => {
                  track.start_time = Constants.getTrackStartTime(track.played_at, track.track.duration_ms);

                });
                //console.log("this.recentAudio", this.recentAudio);
                //to filter out the activities with no tracks
                this.athleteActivities = unfilteredActivites;
                //this.athleteActivities = unfilteredActivites.filter(activity => activity.end_date >= this.recentAudio[(this.recentAudio.length) - 1].start_time);
              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.isLoading = false;
              });
            };

            this.isLoading = false;
          });
          //console.log("db fetched activities", this.athleteActivities);

        } else if (actResponse.statusCode === 404) {

          this.isLoading = false;
        };

      });
    }, 1500);

  }


  getActivityDetails(activityId: number, activityTime: any, isSaved: boolean) {
    var activityData: any = {
      activityId: activityId,
      activityTime: activityTime,
      isSaved: isSaved
    };
    sessionStorage.setItem('activity-data',JSON.stringify(activityData));
    this.router.navigate(['/strava/activity-details']);
  }






























  FetchActivitiesFromStrava() {
    this.startCheckingToken();
    this.fetchThirdPartyDetails();
  }

  clear(table: Table) {
    table.clear();
  }


}
