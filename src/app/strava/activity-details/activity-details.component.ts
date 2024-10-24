import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ActivityDetailChartComponent } from '../shared/activity-detail-chart/activity-detail-chart.component';
import { Title } from '@angular/platform-browser';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { StravaService } from '../shared/services/strava.service';
import { Constants } from '../../shared/Constants';
import { PostActivityDetailRequest } from '../shared/models/strava-models';
import { PairedTrackJsonObject, TrackMetricRequest, PostTrackRequest } from '../../spotify/shared/models/spotify-models';
import { Router } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AuthService } from '../../user/shared/services/auth.service';





@Component({
  selector: 'app-activity-details',
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
    InputSwitchModule
  ],
  templateUrl: './activity-details.component.html',
  styleUrl: './activity-details.component.css',
  providers: [MessageService]
})

export class ActivityDetailsComponent implements OnInit {
  messages: Message[] = [
    { severity: 'warn', detail: 'Strava or Spotify not linked. Please, link them first.' },
  ];
  isStravaLinked: boolean = true;
  isLoading: boolean = false;
  isADSaved: boolean = false;
  showAudioFeatures: boolean = false;
  showActivityGraph: boolean = false;
  audioFeatures: any[] = [];
  pairedResult: any;
  pairedTracks: any[] = [];
  activityDetails: any[] = [];
  currentActivityData: { activityId: number, activityTime: any, isSaved: boolean } = {
    activityId: 0,
    activityTime: undefined,
    isSaved: false
  };
  recentAudio: any[] = [];
  activityStreams: any;
  toBeUpdated: boolean = false;
  icon: string = ''

















  constructor(
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private spotifyService: SpotifyService,
    private primengConfig: PrimeNGConfig,
    private messageService: MessageService,
    private title: Title,
    private router: Router,
    private authService: AuthService
  ) {
    this.title.setTitle('AudioActive - ActivityDetails');
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.currentActivityData = JSON.parse(sessionStorage.getItem('activity-data') || '');
    this.primengConfig.ripple = true;
  }

  ngOnInit(): void {
    this.getActivityDetails(
      this.currentActivityData.activityId,
      this.currentActivityData.activityTime,
      this.currentActivityData.isSaved
    );


  }



  //#To get actvity details by Id
  getActivityDetails(activityId: number, activityTime: any, isSaved: boolean) {
    this.isLoading = true;
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
              this.isAM(this.activityDetails[0]?.start_date);
              this.getActivityStreams(response.id, stravaAccessToken);
              // console.log('Activity Details', this.activityDetails);
              this.pairItems(this.activityDetails, this.recentAudio);
            });
          };
        };
      });
    };

  }

  getSavedADAndPairAudio(activityId: number, activityTime: any) {
    this.isLoading = true;
    this.activityDetails = [];
    this.stravaService.getActivityDetailById(activityId).subscribe((dbResponse) => {
      if (dbResponse.statusCode === 200) {
        this.activityDetails.push(dbResponse.payload.jsonData);
        this.isAM(this.activityDetails[0]?.start_date);
        // console.log("db fetched activityDetails", this.activityDetails);

        //preceeding code
        this.pairedTracks = this.activityDetails[0].audio;

        this.pairedTracks.forEach(pt => {
          pt.isSaved = true; //Boolean value to differenciate that it is from db

          if (pt.track) {
            //removed the api calls from the track (Code improvization)
            pt.track = JSON.parse(pt.track)
          } else {
            pt.track = {
              id: pt.trackid,
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
          if (pt.isOmitted) {
            pt.isOmitted = JSON.parse(pt.isOmitted);
          };
          this.isADSaved = true;
        });

        // console.log("this.pairedTracks", this.pairedTracks);

        this.isLoading = false;
      } else if (dbResponse.statusCode === 404) {
        this.getActivityDetails(activityId, activityTime, false);
      } else {
        this.isLoading = false;
      };

    }
    );
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
          // console.log("this.recentAudio", this.recentAudio);
          //to filter out the activities with no tracks

          //to pair the activity and song
          if (stravaAccessToken.length > 0 && Constants.stravaSettings.clientId !== 0) {
            this.stravaService.StravaCommonGetApi(activityUrl, stravaAccessToken).subscribe((response) => {
              response.end_date = Constants.getActivityEndTime(response.start_date, response.elapsed_time);
              this.activityDetails.push(response);
              this.isAM(this.activityDetails[0]?.start_date);
              this.getActivityStreams(response.id, stravaAccessToken);
              // console.log('Activity Details', this.activityDetails);
              this.pairItems(this.activityDetails, this.recentAudio);
            });
          };

        }, error => {
          this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
          this.isLoading = false;
        });

      };
    });
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
        }, error => {
          this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
          this.isLoading = false;
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
      result[0].tracks.forEach((track, index) => {
        if (track.track.name !== 'No Track') {
          this.spotifyService.getSpotifyAudioFeaturesUrl(track.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;

              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((audioFeature) => {
                track.audio_features = audioFeature;
                track.duration_mins = Constants.formatDuration(track.track.duration_ms);

              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.isLoading = false;
              });
            };
          });
        };
        //code to remove tracks whose start time lies before previous track's end time
        // if (index > 0) {

        //   if (new Date(result[0].tracks[index].start_time) < new Date(result[0].tracks[index - 1].played_at)) {
        //     console.log('erronous track', result[0].tracks[index]);
        //     result[0].tracks.splice(index , 1);
        //   }
        // };
      });
    };
    this.pairedResult = result;
    // console.log("pairedItems", result);
    this.isLoading = false;
    return result;
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
            // console.log("track added successfully.");

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
        isOmitted: pt.isOmitted ? pt.isOmitted : false
      };

      this.spotifyService.postTrackMetric(trackMetric).subscribe((postMetricResponse) => {
        if (postMetricResponse.statusCode === 200) {
          // console.log('metric posted successfully.');

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
        // console.log("actvity detail added successfully.");

        this.isADSaved = true;
        this.isLoading = false;
        this.navigateToActivities();
      };
    });
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
          }, error => {
            this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
            this.isLoading = false;
          });
        };
      });
    };
  }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  showActivityGraphChanged() {
    this.showActivityGraph = !this.showActivityGraph;
  }

  navigateToActivities() {
    this.router.navigate(['/strava/activities']);
  }

  changeOmissionStatus(event: any, trackId: string, played_at: string) {
    this.pairedTracks.forEach(pt => {
      if (pt.track.id === trackId && pt.played_at === played_at) {
        pt.isOmitted = event.checked;
      };
    });
  }


  updateActivityDetail() {
    // console.log("updated activityDetails", this.activityDetails);

    this.isLoading = true;
    //to store activity detail and track json
    var pairedTrackJsonArray: PairedTrackJsonObject[] = [];
    this.pairedTracks.forEach(pt => {
      var PTrackJson = Constants.typeCastPairedTrackJson(pt);
      pairedTrackJsonArray.push(PTrackJson);

      //to add trackMetrics
      var trackMetric: TrackMetricRequest = {
        id: 'f46876c9-aa8d-42c3-b6a7-5892c2aa445d',
        userId: this.authService.getUserIdFromToken(),
        providerActivityId: this.activityDetails[0].id,
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
        isOmitted: pt.isOmitted ? pt.isOmitted : false
      };

      this.spotifyService.updateTrackMetric(trackMetric).subscribe((postMetricResponse) => {
        if (postMetricResponse.statusCode === 200) {
          // console.log('metric posted successfully.');

        };
      });
    });
    var activityDetailJson = Constants.typeCastActivityDetailJson(this.activityDetails[0])
    activityDetailJson.audio = pairedTrackJsonArray;
    var activityDetailRequest: PostActivityDetailRequest = {
      providerActivityId: activityDetailJson.id,
      jsonData: JSON.stringify(activityDetailJson)
    };
    this.stravaService.updateActivityDetail(activityDetailRequest).subscribe((adResponse) => {
      this.isLoading = true;
      if (adResponse.statusCode === 200) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Activity details saved successfully.' });
        // console.log("actvity detail added successfully.");

        this.isADSaved = true;
        this.isLoading = false;
        this.navigateToActivities();
      };
    });

  }

  isAM(date: string | Date) {
    const hours = new Date(date).getHours();
    const isDaytime = hours >= 6 && hours < 18;
    if (isDaytime) {
      this.icon = 'bi bi-cloud-sun-fill';
    } else {
      this.icon = 'bi bi-cloud-moon-fill'
    };
    //return isDaytime;
  }


























































}
