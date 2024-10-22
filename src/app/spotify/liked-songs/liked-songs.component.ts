import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { Constants } from '../../shared/Constants';
import { AuthService } from '../../user/shared/services/auth.service';
import { PostTrackAnalysisRequest, PostTrackRequest } from '../shared/models/spotify-models';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';
import { Title } from '@angular/platform-browser';
import { PaginatorModule } from 'primeng/paginator';
import { TrackSummaryGraphComponent } from '../shared/track-summary-graph/track-summary-graph.component';
import { TracksData, TrackType } from '../shared/models/graph-models';
import { UriPipe } from "../../shared/common-pipes/uri.pipe";
import { OverlayPanelModule } from 'primeng/overlaypanel';



@Component({
  selector: 'app-liked-songs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarComponent,
    MessagesModule,
    TableModule,
    ButtonModule,
    ChartModule,
    InputSwitchModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    TooltipModule,
    ButtonGroupModule,
    RoundPipe,
    PaginatorModule,
    TrackSummaryGraphComponent,
    UriPipe,
    OverlayPanelModule






  ],
  templateUrl: './liked-songs.component.html',
  styleUrl: './liked-songs.component.css',
  providers: [
    ConfirmationService
  ]
})
export class LikedSongsComponent implements OnInit {
  likedSongs: any[] = [];
  currentPlayListName: string = '';
  currentTrackName = '';
  checkInterval: any;
  isLoading: boolean = false;
  data: any;
  data2: any;
  //showDetailedGraph: boolean = false;
  showSummaryGraph: boolean = false;
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
  options: any = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: this.textColor
        }
      },
      tooltip: {
        callbacks: {
          // Customize the label in the tooltip
          label: function (context: any) {
            return `(${context.dataset.tracks[context.parsed.x]}) - ${context.dataset.label}:${context.raw}`; // Customize label
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: this.textColorSecondary
        },
        grid: {
          color: this.surfaceBorder,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: this.textColorSecondary
        },
        grid: {
          color: this.surfaceBorder,
          drawBorder: false
        }
      }
    }
  };
  plNameVisible: boolean = false;
  playlistName: string = '';
  originalTracks: string[] = [];
  reOrderedTracks: string[] = [];
  pattern = '\\S+.*';
  nonSavedTrackIds: string[] = [];
  tracksListVisible: boolean = false;
  selectedPlaylist: any;
  userPlaylists: any[] = [];
  selectedTracksList: any[] = [];
  pageSize: number = 10;
  offset: number = 0;
  totalLikedSongsCount: number = 0;
  dataMessage: string = '';
  tracksData: TracksData = {
    trackType: TrackType.LikedSongs,
    tracks: []
  };
  @ViewChild('tableRef') table!: Table;
  showPreview: boolean = false;
  currentTrack: any;
  allLikedSongs: any[] = [];






  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private authService: AuthService,
    private title: Title
  ) {
    this.title.setTitle('AudioActive - Liked Songs')
    this.fetchThirdPartyDetails();
    this.startCheckingToken();
  }

  ngOnInit(): void {

  }

  getSegmentColor(ctx: any, datasetIndex: number, data: any) {
    const { p0 } = ctx;
    const index = p0.parsed.x;  // Index of the current data point
    const color = data.datasets[datasetIndex].colors[index];  // Get color for the segment

    //return color ;  // Default color if not set
    return this.documentStyle.getPropertyValue(color);
  }


  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    };
  }

  startCheckingToken(): void {
    this.isLoading = true;
    this.checkInterval = setInterval(() => {
      const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
      if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
        // this.getLikedSongs(this.offset, this.pageSize);
        this.fetchAllLikedSongs();
        clearInterval(this.checkInterval); // Stop the interval
      } else {
        this.fetchThirdPartyDetails();
      }
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
  }

  fetchAllLikedSongs() {
    this.isLoading = true;
    this.dataMessage = 'Loading data...';
    this.allLikedSongs = [];
    this.selectedTracksList = [];
    this.spotifyAuthService.refreshSpotifyAccessToken();

    // Fetch the first batch
    this.getLikedSongsBatch(0, 50);

  }

  getLikedSongsBatch(offset: number, limit: number) {
    this.spotifyService.getLikedSongsUrl(offset, limit).subscribe((urlResponse) => {
      if (urlResponse.statusCode === 200) {
        var likedSongsUrl = urlResponse.payload;
        const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';

        if (spotifyAccessToken.length > 0) {
          this.spotifyService.SpotifyCommonGetApi(likedSongsUrl, spotifyAccessToken).subscribe((resp) => {
            // Append the current batch of songs to allLikedSongs
            this.allLikedSongs = this.allLikedSongs.concat(resp.items);

            if (offset === 0) {
              //this.likedSongs = resp.items.slice(this.offset, this.pageSize);
              //this.tracksData.tracks = this.likedSongs;

              // Update total liked songs count
              this.totalLikedSongsCount = resp.total;
              //console.log('this.totalLikedSongsCount', this.totalLikedSongsCount);
            };





            // Check if there are more songs to fetch
            if (this.allLikedSongs.length < this.totalLikedSongsCount) {
              // Fetch the next batch (increment offset)
              this.getLikedSongsBatch(offset + limit, limit);

            } else if (this.allLikedSongs.length === this.totalLikedSongsCount) {
              this.getAudioFeatures();
            }
            else {
              // Finished loading all songs
              // this.isLoading = false;
              this.dataMessage = `Loaded ${this.allLikedSongs.length} songs`;
              //console.log('all liked songs', this.allLikedSongs);
            }
          }, error => {
            this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
            this.isLoading = false;
          });
        }
      }
    });
  }

  getAudioFeatures() {
    // To assign Audio Features to the track
    this.allLikedSongs.forEach((pltrack, index) => {
      //To get Track features from DB
      this.spotifyService.getTrackById(pltrack.track.id).subscribe((dbTrackRes) => {

        pltrack.artist = pltrack.track.artists[0].name;
        if (dbTrackRes.statusCode === 200) {
          //console.log('track found', dbTrackRes.payload.jsonData.audio_features);
          pltrack.audio_features = dbTrackRes.payload.jsonData.audio_features;
        } else {
          //console.log('track not found');
          this.nonSavedTrackIds.push(pltrack.track.id);

          //Add track to DB after fetching it's features
          this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audio_features = res;
                //add track to db with it's features
                var trackJson = Constants.typeCastTrackJson(pltrack);
                var postTrackRequest: PostTrackRequest = {
                  providerTrackId: pltrack.track.id,
                  trackData: JSON.stringify(trackJson)
                };
                this.spotifyService.postTrack(postTrackRequest).subscribe(postTrackRes => {
                  if (postTrackRes.statusCode === 200) {
                    //console.log("track added successfully.", pltrack.track.name);
                    pltrack.audio_features.tempo = Math.round(pltrack.audio_features.tempo);
                    pltrack.audio_features.loudness = Math.round(pltrack.audio_features.loudness * (-10));
                    pltrack.audio_features.energy = Math.round(pltrack.audio_features.energy * (100));
                    pltrack.audio_features.danceability = Math.round(pltrack.audio_features.danceability * (100));
                  };
                });
                
              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.dataMessage = 'No tracks found in liked songs.';
                this.isLoading = false;
              });
            };
          });
        };
        if (index === this.totalLikedSongsCount - 1) {
          setTimeout(() => {
            this.isLoading = false;
            this.onPageChange({ first: this.offset, rows: this.pageSize });
            this.dataMessage = 'No tracks found in liked songs.';
          }, 3000);
        };
      });

    });
  }



  // getLikedSongs(offset: number, limit: number) {
  //   this.isLoading = true;
  //   this.dataMessage = 'Loading data...';
  //   this.likedSongs = [];
  //   this.selectedTracksList = [];
  //   this.spotifyAuthService.refreshSpotifyAccessToken();

  //   this.spotifyService.getLikedSongsUrl(offset, limit).subscribe((urlResponse) => {
  //     if (urlResponse.statusCode === 200) {
  //       var likedSongsUrl = urlResponse.payload;

  //       const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
  //       if (spotifyAccessToken.length > 0) {

  //         this.spotifyService.SpotifyCommonGetApi(likedSongsUrl, spotifyAccessToken).subscribe((resp) => {
  //           // debugger;
  //           this.totalLikedSongsCount = resp.total;
  //           this.likedSongs = resp.items;

  //           this.likedSongs.forEach(pltrack => {
  //             pltrack.artist = pltrack.track?.artists[0]?.name;
  //             this.originalTracks.push(pltrack.track.id);
  //           });
  //           //console.log('this.playlistTracks', this.likedSongs);

  //           if (this.likedSongs.length > 0) {
  //             // To assign Audio Features to the track
  //             this.likedSongs.forEach((pltrack) => {
  //               pltrack.color = Constants.generateRandomPrimeNGColor();
  //               //To get Track features from DB
  //               this.spotifyService.getTrackById(pltrack.track.id).subscribe((dbTrackRes) => {

  //                 if (dbTrackRes.statusCode === 200) {
  //                   //console.log('track found', dbTrackRes.payload.jsonData.audio_features);
  //                   pltrack.audio_features = dbTrackRes.payload.jsonData.audio_features;
  //                 } else {
  //                   //console.log('track not found');
  //                   this.nonSavedTrackIds.push(pltrack.track.id);

  //                   //Add track to DB after fetching it's features
  //                   this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.track.id).subscribe((res) => {
  //                     if (res.statusCode === 200) {
  //                       var featuresUrl = res.payload;
  //                       const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
  //                       this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
  //                         pltrack.audio_features = res;
  //                         //add track to db with it's features
  //                         var trackJson = Constants.typeCastTrackJson(pltrack);
  //                         var postTrackRequest: PostTrackRequest = {
  //                           providerTrackId: pltrack.track.id,
  //                           trackData: JSON.stringify(trackJson)
  //                         };
  //                         this.spotifyService.postTrack(postTrackRequest).subscribe(postTrackRes => {
  //                           if (postTrackRes.statusCode === 200) {
  //                             //console.log("track added successfully.", pltrack.track.name);
  //                             pltrack.audio_features.tempo = Math.round(pltrack.audio_features.tempo);
  //                             pltrack.audio_features.loudness = Math.round(pltrack.audio_features.loudness * (-10));
  //                             pltrack.audio_features.energy = Math.round(pltrack.audio_features.energy * (100));
  //                             pltrack.audio_features.danceability = Math.round(pltrack.audio_features.danceability * (100));
  //                           };
  //                         });
  //                       }, error => {
  //                         this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
  //                         this.isLoading = false;
  //                       });
  //                     };
  //                   });
  //                 };
  //               });
  //               // //To get track analysis
  //               // this.spotifyService.getTrackAnalysisById(pltrack.track.id).subscribe((taRes) => {

  //               //   if (taRes.statusCode === 200) {
  //               //     // console.log('track analysis found from db', taRes.payload.analysisJsonData);
  //               //     pltrack.audioAnalysis = taRes.payload.analysisJsonData;
  //               //     this.isLoading = true;
  //               //   } else {
  //               //     //console.log('track analysis not found');
  //               //     //To fetch track analysis
  //               //     this.spotifyService.getSpotifyAudioAnalysisUrl(pltrack.track.id).subscribe((res) => {
  //               //       if (res.statusCode === 200) {
  //               //         var analysisUrl = res.payload;
  //               //         const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
  //               //         this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((res) => {
  //               //           pltrack.audioAnalysis = res;
  //               //           //To add track analysis
  //               //           var trackAnalysis = Constants.typeCastTrackAnalysisJson(pltrack.audioAnalysis);
  //               //           var PostTrackAnalysisRequest: PostTrackAnalysisRequest = {
  //               //             providerTrackId: pltrack.track.id,
  //               //             trackAnalysisData: JSON.stringify(trackAnalysis)
  //               //           };
  //               //           this.spotifyService.postTrackAnalysis(PostTrackAnalysisRequest).subscribe((postTrackAnalysisResponse) => {
  //               //             if (postTrackAnalysisResponse.statusCode === 200) {
  //               //               //console.log("track analysis added successfully.");
  //               //               pltrack.audioAnalysis = Constants.typeCastTrackAnalysisJson(pltrack.audioAnalysis);
  //               //             };
  //               //           });
  //               //         });
  //               //       };
  //               //     });
  //               //     this.isLoading = true;
  //               //   };
  //               // });
  //             });
  //             this.tracksData.tracks = this.likedSongs;
  //             setTimeout(() => {
  //               //debugger;
  //               if (this.table) {
  //                 var sortEvent: any = {

  //                   field: this.table?.sortField,
  //                   order: this.table?.sortOrder
  //                 };
  //                 this.tableSorted(sortEvent);
  //               };

  //               //console.log('nonSavedTrackIds', this.nonSavedTrackIds);
  //               // if (this.nonSavedTrackIds.length > 0) {
  //               //   var severalIds = this.nonSavedTrackIds.join(',');
  //               //   //console.log(severalIds);
  //               //   this.spotifyService.getSeveralAudioFeaturesUrl().subscribe((safUrlResponse) => {
  //               //     if (safUrlResponse.statusCode === 200) {
  //               //       var safUrl = safUrlResponse.payload + severalIds;
  //               //       this.spotifyService.SpotifyCommonGetApi(safUrl, spotifyAccessToken).subscribe((safResponse) => {

  //               //         safResponse.audio_features.forEach((audioFeature: any) => {
  //               //           var matchedSong = this.likedSongs.find(song => song.track.id === audioFeature.id);
  //               //           matchedSong.audio_features = audioFeature;

  //               //           //add track to db with it's features
  //               //           var trackJson = Constants.typeCastTrackJson(matchedSong);
  //               //           var postTrackRequest: PostTrackRequest = {
  //               //             providerTrackId: matchedSong.track.id,
  //               //             trackData: JSON.stringify(trackJson)
  //               //           };
  //               //           this.spotifyService.postTrack(postTrackRequest).subscribe(postTrackRes => {
  //               //             if (postTrackRes.statusCode === 200) {
  //               //               //console.log("track added successfully.", matchedSong.track.name);
  //               //               matchedSong.audio_features.tempo = Math.round(matchedSong.audio_features.tempo);
  //               //               matchedSong.audio_features.loudness = Math.round(matchedSong.audio_features.loudness * (-10));
  //               //               matchedSong.audio_features.energy = Math.round(matchedSong.audio_features.energy * (100));
  //               //               matchedSong.audio_features.danceability = Math.round(matchedSong.audio_features.danceability * (100));

  //               //             };
  //               //           });

  //               //         });
  //               //       });
  //               //     };
  //               //   });
  //               // };

  //               this.dataMessage = 'No tracks found in liked songs.';
  //               this.isLoading = false;

  //             }, (this.likedSongs.length > 25) ? 8000 : 5000);
  //           } else {
  //             this.isLoading = false;
  //           }
  //         }, error => {
  //           this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
  //           this.isLoading = false;
  //         });
  //       };
  //     } else {
  //       this.dataMessage = 'No tracks found in liked songs.';
  //     }
  //   });
  // }

  // showGraphChanged(toRefresh: boolean) {
  //   if (!toRefresh) {
  //     //this.showDetailedGraph = !this.showDetailedGraph;
  //     this.showSummaryGraph = false;
  //   };
  //   if (this.showDetailedGraph) {
  //     if (this.selectedTracksList.length > 0) {
  //       //this.selectedTrackIds = Array.from(new Set(this.selectedTrackIds));
  //       var selectedTracks = this.likedSongs?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
  //       selectedTracks = selectedTracks.reduce((acc, current) => {
  //         const x = acc.find((item: any) => item.track.id === current.track.id);
  //         if (!x) {
  //           acc.push(current);
  //         }
  //         return acc;
  //       }, []);
  //       this.generateChart(selectedTracks, true);
  //     } else {
  //       this.generateChart(this.likedSongs, true);
  //     }

  //   };
  // }

  showSummaryGraphChanged(toRefresh: boolean) {
    if (!toRefresh) {
      this.showSummaryGraph = !this.showSummaryGraph;
      // this.showDetailedGraph = false;
    };
    if (this.showSummaryGraph) {
      this.isLoading = true;
      this.data2 = {
        labels: [],
        datasets: [
          {
            label: 'Tempo',
            data: [],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--blue-500'),
            tension: 0.4,
            tracks: [],
            pointBackgroundColor: '#000000',
            pointBorderColor: '#000000',
            // colors: [],  // Add an array to store color information
            // segment: {
            //   borderColor: (ctx: any) => this.getSegmentColor(ctx, 0, this.data2)  // Pass dataset index to getSegmentColor
            // }
          },
          {
            label: 'Loudness',
            data: [],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--orange-500'),
            tension: 0.4,
            tracks: [],
            pointBackgroundColor: '#000000',
            pointBorderColor: '#000000',
            // colors: [],  // Add an array to store color information
            // segment: {
            //   borderColor: (ctx: any) => this.getSegmentColor(ctx, 1, this.data2)  // Pass dataset index to getSegmentColor
            // }
          },
          {
            label: 'Energy',
            data: [],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--red-500'),
            tension: 0.4,
            tracks: [],
            pointBackgroundColor: '#000000',
            pointBorderColor: '#000000',
            // colors: [],  // Add an array to store color information
            // segment: {
            //   borderColor: (ctx: any) => this.getSegmentColor(ctx, 2, this.data2)  // Pass dataset index to getSegmentColor
            // }
          },
          {
            label: 'Danceability',
            data: [],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--green-500'),
            tension: 0.4,
            tracks: [],
            pointBackgroundColor: '#000000',
            pointBorderColor: '#000000',
            // colors: [],  // Add an array to store color information
            // segment: {
            //   borderColor: (ctx: any) => this.getSegmentColor(ctx, 3, this.data2)  // Pass dataset index to getSegmentColor
            // }
          }
        ]
      };
      var durationSum = 0;
      if (this.selectedTracksList.length > 0) {
        var selectedTracks = this.likedSongs?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
        selectedTracks = selectedTracks.reduce((acc, current) => {
          const x = acc.find((item: any) => item.track.id === current.track.id);
          if (!x) {
            acc.push(current);
          }
          return acc;
        }, []);
        selectedTracks.forEach(pltrack => {
          durationSum = durationSum + ((pltrack.audio_features.duration_ms));
          //duration
          this.data2.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
          //tempo
          this.data2.datasets[0].data.push(pltrack.audio_features.tempo);
          this.data2.datasets[0].tracks.push(pltrack.track.name);
          // this.data2.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data2.datasets[1].data.push(pltrack.audio_features.loudness);
          this.data2.datasets[1].tracks.push(pltrack.track.name);
          // this.data2.datasets[1].colors.push(pltrack.color);
          //energy
          this.data2.datasets[2].data.push(pltrack.audio_features.energy);
          this.data2.datasets[2].tracks.push(pltrack.track.name);
          // this.data2.datasets[2].colors.push(pltrack.color);
          //danceability
          this.data2.datasets[3].data.push(pltrack.audio_features.danceability);
          this.data2.datasets[3].tracks.push(pltrack.track.name);
          // this.data2.datasets[3].colors.push(pltrack.color);
        });
        // console.log('this.data2', this.data2);
        this.isLoading = false;
      } else {
        var durationSum = 0;
        this.likedSongs.forEach(pltrack => {

          durationSum = durationSum + ((pltrack.audio_features.duration_ms));
          //duration
          this.data2.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
          //tempo
          this.data2.datasets[0].data.push(pltrack.audio_features.tempo);
          this.data2.datasets[0].tracks.push(pltrack.track.name);
          //this.data2.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data2.datasets[1].data.push(pltrack.audio_features.loudness);
          this.data2.datasets[1].tracks.push(pltrack.track.name);
          //this.data2.datasets[1].colors.push(pltrack.color);
          //energy
          this.data2.datasets[2].data.push(pltrack.audio_features.energy);
          this.data2.datasets[2].tracks.push(pltrack.track.name);
          //this.data2.datasets[2].colors.push(pltrack.color);
          //danceability
          this.data2.datasets[3].data.push(pltrack.audio_features.danceability);
          this.data2.datasets[3].tracks.push(pltrack.track.name);
          //this.data2.datasets[3].colors.push(pltrack.color);

        });
        //console.log('this.data2',this.data2);
        this.isLoading = false;
      };
    };
  }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }



  tableReordered(event: any) {
    this.reOrderedTracks = [];

    this.likedSongs.forEach(plTrack => {
      this.reOrderedTracks.push(plTrack.track.id)
    });
    this.tracksData.tracks = this.likedSongs;
  }

  tableSorted(event: any) {
    let field = event.field;
    let order = event.order;
    this.reOrderedTracks = [];

    const getFieldValue = (obj: any, field: string) => {
      return field?.split('.').reduce((value, key) => value ? value[key] : undefined, obj);
    };

    this.likedSongs = this.allLikedSongs.sort((a, b) => {
      const valueA = getFieldValue(a, field);
      const valueB = getFieldValue(b, field);
      // Handling undefined values
      if (valueA === undefined) return 1;  // Consider undefined as larger
      if (valueB === undefined) return -1;
      // Comparison logic based on field type
      let comparison = 0;
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // For strings, use localeCompare for proper alphabetical order
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        // For numbers, directly compare
        comparison = valueA - valueB;
      } else if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }
      return comparison * order; // Apply the sort order: 1 for ascending, -1 for descending
    });
    this.allLikedSongs.forEach(plTrack => {
      this.reOrderedTracks.push(plTrack.track.id)
    });
    // //temp code 
    // var reOrderedTracks = this.playlistTracks.map(plTrack => { return plTrack.track.name });
    // console.log(reOrderedTracks);
    // ///////

    this.tracksData.tracks = this.likedSongs;
  }


  generateChart(playlistTracks: any[], showChartChanged: boolean = false) {
    this.isLoading = true;

    // To reset data
    this.data = {
      labels: ['0:00:00'],
      datasets: [
        {
          label: 'Tempo',
          data: [0],
          fill: false,
          borderColor: this.documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4,
          tracks: [''],
          colors: [],  // Add an array to store color information
          segment: {
            borderColor: (ctx: any) => this.getSegmentColor(ctx, 0, this.data)  // Pass dataset index to getSegmentColor
          }
        },
        {
          label: 'Loudness',
          data: [0],
          fill: false,
          borderColor: this.documentStyle.getPropertyValue('--orange-500'),
          tension: 0.4,
          tracks: [''],
          colors: [],  // Add an array to store color information
          segment: {
            borderColor: (ctx: any) => this.getSegmentColor(ctx, 1, this.data)  // Pass dataset index to getSegmentColor
          }
        }
      ]
    };
    var durationSum = 0;
    setTimeout(() => {
      playlistTracks.forEach(pltrack => {
        pltrack.audioAnalysis.sections.forEach((section: any) => {
          durationSum = durationSum + ((section.duration) * 1000);
          //duration
          this.data.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
          //tempo
          this.data.datasets[0].data.push(section.tempo);
          this.data.datasets[0].tracks.push(pltrack.track.name);
          this.data.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data.datasets[1].data.push(section.loudness);
          this.data.datasets[1].tracks.push(pltrack.track.name);
          this.data.datasets[1].colors.push(pltrack.color);
        });
      });
      // if (showChartChanged) {
      //   this.showDetailedGraph = true;
      // };
      this.isLoading = false;
      // console.log('data', this.data);
    }, 3000);
  }

  createNewPlaylist() {
    this.plNameVisible = false;
    this.isLoading = true;
    var userId = this.authService.getUserIdFromToken();
    this.spotifyService.getSpotifyUser(userId).subscribe((mapRes) => {
      if (mapRes.statusCode === 200) {
        //console.log(mapRes);
        var spotifyUserId = mapRes.payload.spotifyUserId
        this.spotifyService.getCreateNewPlaylistUrl(spotifyUserId).subscribe((urlRes) => {
          if (urlRes.statusCode === 200) {
            var playlistUrl = urlRes.payload;
            let body: any = {
              name: this.playlistName,
              description: "",
              public: false
            };
            const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
            this.spotifyService.SpotifyCommonPostApi(playlistUrl, body, spotifyAccessToken).subscribe((npResponse) => {
              var newPlaylistId = npResponse.id;
              //to push the existing items to the new playlist
              this.spotifyService.getPlaylistOpsUrl(newPlaylistId).subscribe(ploResponse => {
                debugger;
                if (ploResponse.statusCode === 200) {
                  let plOpsUrl = ploResponse.payload;
                  let plOpsBody: any = {
                    uris: [],
                    position: 0
                  };
                  // if (this.reOrderedTracks.length != 0) {
                  //   this.reOrderedTracks.forEach(trackId => {
                  //     plOpsBody.uris.push(`spotify:track:${trackId}`)
                  //   });
                  // } else 
                  if (this.selectedTracksList.length != 0) {
                    this.selectedTracksList.forEach(selectedTrack => {
                      plOpsBody.uris.push(`spotify:track:${selectedTrack.track.id}`)
                    });
                  } else {
                    this.originalTracks.forEach(trackId => {
                      plOpsBody.uris.push(`spotify:track:${trackId}`)
                    });
                  }
                  this.spotifyService.SpotifyCommonPostApi(plOpsUrl, plOpsBody, spotifyAccessToken).subscribe((addedItemsResponse) => {
                    // console.log(addedItemsResponse);
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New playlist created successfully.' });
                    this.router.navigate(['/spotify/playlists']);
                  })
                };
              });

            });
          };
        });
      }
    })

  }

  navigateToTrackDetails(trackName: string, trackId: string) {
    sessionStorage.setItem('track-name', trackName);
    sessionStorage.setItem('track-id', trackId);
    this.router.navigate(['/spotify/audio-history']);
  }

  addTracksToExistingPlaylist() {
    this.tracksListVisible = true;
    this.isLoading = true;
    this.spotifyAuthService.refreshSpotifyAccessToken();
    //this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.spotifyService.getCurrentUserPlaylistsUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        var playlistsUrl = res.payload;
        const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
        this.spotifyService.SpotifyCommonGetApi(playlistsUrl, spotifyAccessToken).subscribe((playlistResponse) => {
          this.userPlaylists = playlistResponse.items;
          // console.log(this.userPlaylists);
        }, error => {
          this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
          this.isLoading = false;
        });
        this.isLoading = false;
      };
    });
  }

  confirmUpdatePlaylist() {
    this.confirmationService.confirm({
      //target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        //this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
        this.updatePlaylist();
      },
      reject: () => {
        // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });
  }

  updatePlaylist() {
    // console.log('selectedPlaylist', this.selectedPlaylist);
    if (this.selectedPlaylist != null) {
      this.spotifyService.getPlaylistOpsUrl(this.selectedPlaylist.id).subscribe((res) => {
        if (res.statusCode === 200) {
          var opsUrl = res.payload;
          const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
          //Code to add new items to the playlist
          let plOpsBody: any = {
            uris: [],
            position: this.selectedPlaylist.tracks.total
          };
          //to store all the selected tracks in db
          this.saveSelectedTracks();

          this.selectedTracksList.forEach(selectedTrack => {
            plOpsBody.uris.push(`spotify:track:${selectedTrack.track.id}`)
          });

          this.spotifyService.SpotifyCommonPostApi(opsUrl, plOpsBody, spotifyAccessToken).subscribe((addedItemsResponse) => {

            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Changes updated successfully.' });
            //this.router.navigate(['/spotify/playlists']);
            this.tracksListVisible = false;
            this.selectedTracksList = [];
          });
        };
      });
    }
  }

  saveSelectedTracks() {
    var selectedTracks = this.likedSongs?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
    selectedTracks = selectedTracks.reduce((acc, current) => {
      const x = acc.find((item: any) => item.track.id === current.track.id);
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);

    selectedTracks.forEach((pltrack) => {
      //To get Track features from DB
      this.spotifyService.getTrackById(pltrack.track.id).subscribe((dbTrackRes) => {

        if (dbTrackRes.statusCode === 200) {
          //console.log('track found', dbTrackRes.payload.jsonData.audio_features);
          pltrack.audio_features = dbTrackRes.payload.jsonData.audio_features;
        } else {
          //console.log('track not found');
          //debugger;
          //Add track to DB after fetching it's features
          this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audio_features = res;
                //add track to db with it's features
                var trackJson = Constants.typeCastTrackJson(pltrack);
                var postTrackRequest: PostTrackRequest = {
                  providerTrackId: pltrack.track.id,
                  trackData: JSON.stringify(trackJson)
                };
                this.spotifyService.postTrack(postTrackRequest).subscribe(postTrackRes => {
                  if (postTrackRes.statusCode === 200) {
                    //console.log("track added successfully.", pltrack.track.name);
                  };
                });
              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.isLoading = false;
              });
            };
          });
        };
      });
      //To get track analysis
      this.spotifyService.getTrackAnalysisById(pltrack.track.id).subscribe((taRes) => {

        if (taRes.statusCode === 200) {
          //console.log('track analysis found', taRes.payload.analysisJsonData);
          pltrack.audioAnalysis = taRes.payload.analysisJsonData;

        } else {
          //console.log('track analysis not found');
          //debugger;
          //To fetch track analysis
          this.spotifyService.getSpotifyAudioAnalysisUrl(pltrack.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var analysisUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audioAnalysis = res;
                //To add track analysis
                var trackAnalysis = Constants.typeCastTrackAnalysisJson(pltrack.audioAnalysis);
                var PostTrackAnalysisRequest: PostTrackAnalysisRequest = {
                  providerTrackId: pltrack.track.id,
                  trackAnalysisData: JSON.stringify(trackAnalysis)
                };
                this.spotifyService.postTrackAnalysis(PostTrackAnalysisRequest).subscribe((postTrackAnalysisResponse) => {
                  if (postTrackAnalysisResponse.statusCode === 200) {
                    //console.log("track analysis added successfully.");

                  };
                });
              }, error => {
                this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
                this.isLoading = false;
              });
            };
          });
        };
      });
    });
  }

  refreshGraphs() {
    // if (this.showSummaryGraph) {
    //   this.showSummaryGraphChanged(true);
    // } else if (this.showDetailedGraph) {
    //   this.showGraphChanged(true);
    // };
    this.showSummaryGraph = false;
    this.isLoading = true;
    setTimeout(() => {
      this.showSummaryGraph = true;
      this.isLoading = false;
    }, 200);
  }

  onPageChange(event: any) {
    this.pageSize = event.rows;
    this.offset = event.first;

    this.tracksData.tracks = this.allLikedSongs.slice(event.first, event.rows);
  }

  showPreviewPopup(track: any) {
    this.showPreview = true;
    this.currentTrack = track.track;
  }

  clear(table: Table) {
    table.clear();
  }


































}
