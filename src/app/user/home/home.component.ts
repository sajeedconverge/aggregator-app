import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { Table, TableModule } from 'primeng/table';
import { Constants } from '../../shared/Constants';
import { CommonModule, DatePipe } from '@angular/common';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { HttpHeaders } from '@angular/common/http';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { PostActivityDetailRequest, PostActivityRequest } from '../../strava/shared/models/strava-models';
import { AuthService } from '../shared/services/auth.service';
import { PairedTrackJsonObject, PostTrackRequest, TrackMetricRequest } from '../../spotify/shared/models/spotify-models';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';
import { Title } from '@angular/platform-browser';
import { ActivityDetailChartComponent } from '../../strava/shared/activity-detail-chart/activity-detail-chart.component';


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
    ProgressBarComponent,
    MessagesModule,
    ToastModule,
    BadgeModule,
    TooltipModule,
    RoundPipe,
    ActivityDetailChartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [MessageService]
})
export class HomeComponent implements OnInit, OnDestroy {
  athleteActivities: any[] = [];
  nonFilteredActivities: any[] = [];
  activityDetails: any[] = [];
  checkInterval: any;
  showDetails: boolean = false;
  recentAudio: any[] = [];
  pairedResult: any;
  pairedTracks: any[] = [];
  showAudioFeatures: boolean = false;
  audioFeatures: any[] = [];
  isLoading: boolean = false;
  activityStreams: any;
  recentlyPlayedFifty: any[] = [];
  stravaAccessToken: string = '';
  spotifyAccessToken: string = '';
  @ViewChild('dt1') table1!: Table;
  @ViewChild('dt2') table2!: Table;
  @ViewChild('dt3') table3!: Table;
  showData: boolean = false;
  messages: Message[] = [
    { severity: 'warn', detail: 'Strava or Spotify not linked. Please, link them first.' },
  ];
  isStravaLinked: boolean = true;
  isADSaved: boolean = false;
  showActivityGraph: boolean = false;



  constructor(
    private stravaAuthService: StravaAuthorizationService,
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private spotifyService: SpotifyService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService,
    private messageService: MessageService,
    private title: Title
  ) {
    this.title.setTitle('AudioActive - Home');
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.primengConfig.ripple = true;
    this.fetchActivitiesFromDb();
    this.fetchThirdPartyDetails();
  }

  ngOnInit(): void {


  }

  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    };
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
                  this.showData = true;
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
              });
            };
          })
        });
      };
    });
  }

  //#To get actvity details by Id
  getActivityDetails(activityId: number, activityTime: any, isSaved: boolean) {
    this.isADSaved = false;
    if (isSaved) {
      this.getSavedADAndPairAudio(activityId, activityTime);
    } else {
      this.isLoading = true;
      // Calling external APIs
      this.activityDetails = [];
      this.pairedTracks = [];
      this.stravaService.getStravaActivityDetailsUrl(activityId).subscribe((res) => {
        if (res.statusCode === 200) {
          this.showDetails = true;
          var activityUrl = res.payload;

          const stravaAccessToken = sessionStorage.getItem('strava-bearer-token') || '';
          const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
          if (!stravaAccessToken) {
            this.showAudioFeatures = true;
            this.messageService.add({ severity: 'warn', summary: 'Failure', detail: 'Details of the Activity is not saved and the Strava is not linked.' });
            this.isLoading = false;
          };
          // debugger;
          if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
            this.getRecentlyPlayedAudio(activityTime, activityUrl, spotifyAccessToken, stravaAccessToken);
          } else {
            this.stravaService.StravaCommonGetApi(activityUrl, stravaAccessToken).subscribe((response) => {
              response.end_date = Constants.getActivityEndTime(response.start_date, response.elapsed_time);
              this.activityDetails.push(response);
              this.getActivityStreams(response.id, stravaAccessToken);
              console.log('Activity Details', this.activityDetails);
              this.pairItems(this.activityDetails, this.recentAudio);
            });
          };
        };
      });
    }
  }

  //#To Get recently played audio and pair it with current activity
  getRecentlyPlayedAudio(activityTime: any, activityUrl: string, spotifyAccessToken: string, stravaAccessToken: string) {
    this.recentAudio = [];
    this.activityDetails = [];
    this.spotifyAuthService.refreshSpotifyAccessToken();
    this.spotifyService.getSpotifyRecentlyPlayedLimitUrl(50).subscribe((res) => {
      if (res.statusCode === 200) {
        const url = res.payload;

        this.spotifyService.SpotifyCommonGetApi(url, spotifyAccessToken).subscribe((audioResponse) => {
          this.recentAudio = audioResponse.items;
          //To calculate track start time
          this.recentAudio.forEach(track => {
            track.start_time = Constants.getTrackStartTime(track.played_at, track.track.duration_ms);
            //track.end_time = Constants.getTrackEndTime(track.played_at, track.track.duration_ms);
          });
          console.log("this.recentAudio", this.recentAudio);
          //to filter out the activities with no tracks
          // console.log("the last recentAudio", this.recentAudio[(this.recentAudio.length) - 1]);
          this.athleteActivities = this.athleteActivities.filter(activity => activity.end_date >= this.recentAudio[(this.recentAudio.length) - 1].start_time);
          //to pair the activity and song
          if (stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0) {
            this.stravaService.StravaCommonGetApi(activityUrl, stravaAccessToken).subscribe((response) => {
              response.end_date = Constants.getActivityEndTime(response.start_date, response.elapsed_time);
              this.activityDetails.push(response);
              this.getActivityStreams(response.id, stravaAccessToken);
              console.log('Activity Details', this.activityDetails);
              this.pairItems(this.activityDetails, this.recentAudio);
            });
          };

        });

      };
    });
  }

  //this method will be called in activities list to pair songs to each activity
  pairItems(activities: any[], tracks: any[]) {
    const result: { activity: any, tracks: any[] }[] = [];
    activities.forEach(activity => {
      var matchedTracks = Constants.assignRecentAudioToActivity(activity, this.recentAudio);

      matchedTracks = matchedTracks.sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      //To enter the no audio items for time gap greater than 5 seconds
      for (let index = 0; index < matchedTracks.length; index++) {
        const currentTrackEndTime = new Date(matchedTracks[index].played_at);
        const nextTrackStartTime = new Date(matchedTracks[index + 1]?.start_time);
        const timeDifference = nextTrackStartTime.getTime() - currentTrackEndTime.getTime();
        const differenceInSeconds = timeDifference / 1000;
        if (differenceInSeconds > 5) {
          //console.log('after song : ', matchedTracks[index]?.track.name, ' The difference is greater than 5 seconds.', differenceInSeconds);
          var noTrackItem = {
            start_time: matchedTracks[index].played_at,
            played_at: matchedTracks[index + 1]?.start_time,
            track: {
              id: matchedTracks[index].played_at,
              name: 'No Track',
              audio_features: {
                tempo: 'N/A'
              },
              artists: [
                {
                  name: 'N/A'
                }
              ],
              duration_ms: timeDifference,
            },
            duration_mins: Constants.formatDuration(timeDifference)
          }
          //matchedTracks.push(noTrackItem);
          matchedTracks.splice(index + 1, 0, noTrackItem);
        };
      };

      //console.log('matchedTracks2', matchedTracks);

      result.push({ activity, tracks: matchedTracks });
    });

    this.pairedTracks = result[0].tracks;

    if (this.pairedTracks.length === 0) {
      this.pairedTracks[0] = {
        track: {
          id: '',
          name: 'No Track',
          artists: [{ name: 'N/A' }]
        },
        start_time: '',
        distance_start: 0.00,
        distance_end: 0.00,
        distance: 0.00,
        speed: 0.00
      };
      //if there is no match no streams would be fetched
      this.isLoading = false;
    } else {
      //To get audio feature every song played during the activity
      result[0].tracks.forEach((track) => {
        if (track.track.name !== 'No Track') {
          this.spotifyService.getSpotifyAudioFeaturesUrl(track.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;

              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((audioFeature) => {
                track.audio_features = audioFeature;
                track.duration_mins = Constants.formatDuration(track.track.duration_ms);

              });
            };
          });
        };
      });
    };
    this.pairedResult = result;
    console.log("pairedItems", result);
    this.isLoading = false;
    return result;
  }

  //To get audio features
  getAudioFeatures(trackId: string, isSaved: boolean) {
    this.audioFeatures = [];
    if (isSaved) {
      var currentTrack = this.pairedTracks.find(pt => pt.trackid === trackId);
      //console.log(currentTrack);
      this.audioFeatures.push(currentTrack.track.audio_features);
      this.showAudioFeatures = true;
    } else {
      this.spotifyAuthService.refreshSpotifyAccessToken();
      this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
        if (res.statusCode === 200) {
          var featuresUrl = res.payload;
          const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
          this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((audioFeature) => {

            audioFeature.tempo = Math.round(audioFeature.tempo);
            audioFeature.loudness = Math.round(audioFeature.loudness * (-10));
            audioFeature.energy = Math.round(audioFeature.energy * (100));
            audioFeature.danceability = Math.round(audioFeature.danceability * (100));

            this.audioFeatures.push(audioFeature);
            this.showAudioFeatures = true;
          });
        };
      });
    };
  }

  //To get activity streams
  getActivityStreams(activityId: number, stravaAccessToken: string) {
    this.stravaService.getStravaActivityStreamsUrl(activityId).subscribe((urlResponse) => {
      if (urlResponse.statusCode === 200) {
        var streamsUrl = urlResponse.payload;

        this.spotifyService.SpotifyCommonGetApi(streamsUrl, stravaAccessToken).subscribe((streamRes) => {
          if (streamRes) {
            this.activityStreams = streamRes;

            this.pairedResult[0].activity.activity_streams = this.activityStreams;
            //console.log("this.activityStreams", this.activityStreams);

            var activityStartTime = this.pairedResult[0].activity.start_date;
            var distanceStream = this.pairedResult[0].activity.activity_streams.find((stream: any) => stream.type === 'distance');
            var timeStream = this.pairedResult[0].activity.activity_streams.find((stream: any) => stream.type === 'time');

            var mappedStream = Constants.processStreams(activityStartTime, distanceStream, timeStream);
            //console.log('mappedStream', mappedStream);

            //to add stream calculations into the tracks
            this.pairedResult[0].tracks.forEach((track: any) => {

              var trackStartTime = track.start_time;
              var trackEndTime = track.played_at;

              var startDistObject = Constants.findNearestStartTime(mappedStream, trackStartTime);

              var endDistObject = Constants.findNearestEndTime(mappedStream, startDistObject.time, trackEndTime);

              track.distance_start = (startDistObject?.distance || 0) / 1000;
              track.distance_end = (endDistObject?.distance || 0) / 1000;
              track.distance = (track.distance_end - track.distance_start);

              var movingTimeMs = 0;
              movingTimeMs = (endDistObject?.duration_increment_ms) - (startDistObject?.duration_increment_ms)

              track.moving_time = Constants.formatDuration(Math.min(movingTimeMs, track.track.duration_ms));

              var hoursTime = (Math.min(movingTimeMs, track.track.duration_ms)) / (1000 * 60 * 60);
              track.speed = (track.distance / (hoursTime));

              track.pace = (track.speed > 0) ? (1000 / ((track.distance * 1000) / (Math.min(movingTimeMs / 1000, track.track.duration_ms / 1000)))) : 0;
              track.pace = Constants.formatDuration(track.pace * 1000);
            });
            this.isLoading = false;
          };
        });

      };
    });
  }

  clear(table: Table) {
    table.clear();
    //this.searchValue = '' 
  }

  saveActivityDetails() {
    this.isLoading = true;
    //to store activity detail and track json
    var pairedTrackJsonArray: PairedTrackJsonObject[] = [];
    this.pairedTracks.forEach(pt => {
      var PTrackJson = Constants.typeCastPairedTrackJson(pt);
      pairedTrackJsonArray.push(PTrackJson);
      //avoid No track records
      if (pt.track.name != 'No Track') {
        //To store individual track into db
        var trackJson = Constants.typeCastTrackJson(pt);
        var PostTrackRequest: PostTrackRequest = {
          providerTrackId: pt.track.id,
          trackData: JSON.stringify(trackJson)
        };
        this.spotifyService.postTrack(PostTrackRequest).subscribe((postTrackResponse) => {
          if (postTrackResponse.statusCode === 200) {
            console.log("track added successfully.");

          }
        });
      };

      //to add trackMetrics
      var trackMetric: TrackMetricRequest = {
        id: 'f46876c9-aa8d-42c3-b6a7-5892c2aa445d',
        userId: 'f46876c9-aa8d-42c3-b6a7-5892c2aa445d',
        providerActivityId: this.pairedResult[0].activity.id,
        providerTrackId: pt.track.id,
        distance: pt.distance,
        distance_start: pt.distance_start,
        distance_end: pt.distance_end,
        duration_mins: pt.duration_mins,
        moving_time: pt.moving_time,
        pace: pt.pace,
        played_at: pt.played_at,
        speed: pt.speed,
        start_time: pt.start_time,
      };

      this.spotifyService.postTrackMetric(trackMetric).subscribe((postMetricResponse) => {
        if (postMetricResponse.statusCode === 200) {
          console.log('metric posted successfully.');

        };
      });
    });
    var activityDetailJson = Constants.typeCastActivityDetailJson(this.pairedResult[0].activity)
    activityDetailJson.audio = pairedTrackJsonArray;
    var activityDetailRequest: PostActivityDetailRequest = {
      providerActivityId: activityDetailJson.id,
      jsonData: JSON.stringify(activityDetailJson)
    };
    this.stravaService.postActivityDetail(activityDetailRequest).subscribe((adResponse) => {
      this.isLoading = true;
      if (adResponse.statusCode === 200) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Activity details saved successfully.' });
        console.log("actvity detail added successfully.");
        this.fetchActivitiesFromDb();
        this.isADSaved = true;
        this.isLoading = false;
      };
    });
  }

  FetchActivitiesFromStrava() {
    this.startCheckingToken();
    this.fetchThirdPartyDetails();
  }


  fetchActivitiesFromDb() {
    this.showDetails = false;
    this.isADSaved = false;
    this.showActivityGraph = false;

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
              });
            };
            this.showData = true;
            this.isLoading = false;
          });
          //console.log("db fetched activities", this.athleteActivities);

        } else if (actResponse.statusCode === 404) {
          this.showData = true;
          this.isLoading = false;
        };

      });
    }, 1500);

  }

  getSavedADAndPairAudio(activityId: number, activityTime: any) {
    this.isLoading = true;
    this.activityDetails = [];
    this.stravaService.getActivityDetailById(activityId).subscribe((dbResponse) => {
      if (dbResponse.statusCode === 200) {
        this.activityDetails.push(dbResponse.payload.jsonData);
        console.log("db fetched activityDetails", this.activityDetails);
        this.showDetails = true;
        //preceeding code
        this.pairedTracks = this.activityDetails[0].audio;

        this.pairedTracks.forEach(pt => {
          pt.isSaved = true; //Boolean value to differenciate that it is from db
          if (pt.track) {
            //removed the api calls from the track (Code improvization)
            pt.track = JSON.parse(pt.track)
          } else {
            pt.track = {
              id: pt.trackId,
              name: 'No Track',
              audio_features: {
                tempo: 0
              },
              artists: [
                {
                  name: 'N/A'
                }
              ],
              duration_ms: pt.duration_mins,
            }
          };
          this.isADSaved = true;
        })
        console.log("this.pairedTracks", this.pairedTracks);

        this.isLoading = false;
      } else if (dbResponse.statusCode === 404) {
        this.getActivityDetails(activityId, activityTime, false);
      } else {
        this.isLoading = false;
      };

    }
      // , err => {
      //   console.log(err);
      //   this.getActivityDetails(activityId, activityTime, false);
      // }
    );
  }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  showActivityGraphChanged() {
    this.showActivityGraph = !this.showActivityGraph;
  }









































































}
