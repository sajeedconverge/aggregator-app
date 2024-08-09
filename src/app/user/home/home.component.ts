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
import { Message, PrimeNGConfig } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ActivityJsonObject, PostActivityDetailRequest, PostActivityRequest } from '../../strava/shared/models/strava-models';
import { AuthService } from '../shared/services/auth.service';
import { PairedTrackJsonObject, PostTrackRequest } from '../../spotify/shared/models/spotify-models';

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
    MessagesModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
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
    { severity: 'warn', detail: 'Strava and Spotify not linked. Please, link them first.' },
  ];
  isStravaLinked: boolean = true;
  isADSaved: boolean = false;

  constructor(
    private stravaAuthService: StravaAuthorizationService,
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private spotifyService: SpotifyService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService
  ) {
    this.primengConfig.ripple = true;

    this.fetchActivitiesFromDb();

    //  this.startCheckingToken();
    //  this.fetchThirdPartyDetails();
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

  // callSpotifyAuth() {
  //   this.spotifyAuthService.loginToSpotify();
  // }

  // callStravaAuth() {
  //   this.stravaAuthService.loginToStrava();
  // }


  getAthleteActivities(accessToken: string) {
    this.isLoading = true;
    this.stravaService.getStravaAthleteActivitiesUrl().subscribe((resp) => {
      if (resp.statusCode === 200) {
        this.stravaService.StravaCommonGetApi(resp.payload, accessToken).subscribe((res) => {
          //this.athleteActivities = res;
          this.nonFilteredActivities = res;
          //To get fifty recently played songs
          this.spotifyService.GetSpotifyRecentlyPlayedFiftyUrl().subscribe((response) => {
            if (response.statusCode === 200) {
              this.spotifyService.SpotifyCommonGetApi(response.payload, this.spotifyAccessToken).subscribe((res) => {
                if (res.items.length > 0) {
                  this.recentlyPlayedFifty = res.items;
                  this.recentlyPlayedFifty.forEach(track => {
                    track.start_time = Constants.getTrackStartTime(track.played_at, track.track.duration_ms);
                  });

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
    if (isSaved) {
      this.getSavedADAndPairAudio(activityId);
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
          }
        };
      });
    }
  }

  //#To Get recently played audio and pair it with current activity
  getRecentlyPlayedAudio(activityTime: any, activityUrl: string, spotifyAccessToken: string, stravaAccessToken: string) {
    this.recentAudio = [];
    this.activityDetails = [];
    this.spotifyAuthService.refreshSpotifyAccessToken();
    this.spotifyService.getSpotifyRecentlyPlayedUrl(activityTime).subscribe((res) => {
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
      const activityStartDate = new Date(activity.start_date).getTime();
      const activityEndDate = new Date(activity.end_date).getTime();

      const matchedTracks = tracks.filter(track => {
        const trackStartDate = new Date(track.start_time).getTime();
        return trackStartDate >= activityStartDate && trackStartDate <= activityEndDate;
      });
      result.push({ activity, tracks: matchedTracks });
    });

    this.pairedTracks = result[0].tracks;

    if (this.pairedTracks.length === 0) {
      this.pairedTracks[0] = {
        track: {
          id: '',
          name: 'No track',
          artists: [{ name: '' }]
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
      });
    };
    this.pairedResult = result;
    console.log("pairedItems", result);
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
      // this.spotifyAuthService.refreshSpotifyAccessToken();
      this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
        if (res.statusCode === 200) {
          var featuresUrl = res.payload;
          const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
          this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((audioFeature) => {
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
            // console.log('mappedStream', mappedStream);

            //to add stream calculations into the tracks
            this.pairedResult[0].tracks.forEach((track: any) => {
              //debugger;
              var trackStartTime = track.start_time;
              var trackEndTime = track.played_at;

              var startDistObject = Constants.findNearestStartTime(mappedStream, trackStartTime);
              //console.log('startDistObject',startDistObject);
              //var endDistObject = Constants.findNearestStartTime(mappedStream, trackEndTime);
              var endDistObject = Constants.findNearestEndTime(mappedStream, startDistObject.time, trackEndTime);
              //console.log('endDistObject',endDistObject);

              track.distance_start = (startDistObject?.distance || 0) * (0.1000);
              track.distance_end = (endDistObject?.distance || 0) * (0.1000);
              track.distance = (track.distance_end - track.distance_start);
              // var hoursTime = (track.track.duration_ms) / (1000 * 60 * 60);
              // track.speed = (track.distance / (hoursTime));

              // var movingTimeSec = Math.floor((track.distance*1000 )/((track.speed)*(5/18)));
              // track.moving_time = Constants.formatDuration(movingTimeSec*1000);
              var movingTimeMs = 0;

              for (let index = (startDistObject?.index || 0); index < (endDistObject?.index || 0); index++) {
                movingTimeMs += mappedStream[index].duration_increment_ms;
              };
              //track.moving_time = Constants.formatDuration((movingTimeMs));
              track.moving_time = Constants.formatDuration(Math.min(movingTimeMs, track.track.duration_ms));

              var hoursTime = (Math.min(movingTimeMs, track.track.duration_ms)) / (1000 * 60 * 60);
              track.speed = (track.distance / (hoursTime));

              track.pace = (1 / track.speed);
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
    //to store activity detail and track json
    var pairedTrackJsonArray: PairedTrackJsonObject[] = [];
    this.pairedTracks.forEach(pt => {
      var PTrackJson = Constants.typeCastPairedTrackJson(pt);
      pairedTrackJsonArray.push(PTrackJson);
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

    });
    var activityDetailJson = Constants.typeCastActivityDetailJson(this.pairedResult[0].activity)
    activityDetailJson.audio = pairedTrackJsonArray;
    var activityDetailRequest: PostActivityDetailRequest = {
      providerActivityId: activityDetailJson.id,
      jsonData: JSON.stringify(activityDetailJson)
    };
    this.stravaService.postActivityDetail(activityDetailRequest).subscribe((adResponse) => {
      if (adResponse.statusCode === 200) {
        console.log("actvity detail added successfully.")
      };
    });
  }

  FetchActivitiesFromStrava() {
//  this.startCheckingToken();
//      this.fetchThirdPartyDetails();
  }


  fetchActivitiesFromDb() {
    this.isLoading = true;
    this.stravaService.getAllActivities().subscribe((actResponse) => {
      if (actResponse.statusCode === 200) {
        //this.athleteActivities= actResponse.payload;
        actResponse.payload.forEach((activity: any) => {
          activity.jsonData.isSaved = true; //Boolean value to differenciate that it is from db
          this.athleteActivities.push(activity.jsonData)
        });
        this.athleteActivities.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        //console.log(actResponse);
        console.log("db fetched activities", this.athleteActivities);

        // this.spotifyService.getAllTracks().subscribe((res) => {
        //   if (res.statusCode === 200) {
        //     res.payload.forEach((dbTrack: any) => {
        //       this.recentAudio.push(dbTrack.jsonData);
        //     });
        //     //console.log('trackresponse',res);
        //     console.log("db fetched audio", this.recentAudio);

        //   }
        // });
        this.showData = true;
        this.isLoading = false;
      };
    });
  }

  getSavedADAndPairAudio(activityId: number) {
    this.isLoading = true;
    this.isADSaved = true;
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
          //api call to gettrack by provider id
          this.spotifyService.getTrackById(pt.trackid).subscribe(trackResponse => {
            if (trackResponse.statusCode === 200) {
              pt.track = trackResponse.payload.jsonData;
            };
          })
        })
        console.log("this.pairedTracks", this.pairedTracks);


        this.isLoading = false;
      } else {
        this.isLoading = false;
      };

    })
  }



}
