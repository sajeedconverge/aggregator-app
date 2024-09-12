import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Router } from '@angular/router';
import { Constants } from '../../shared/Constants';
import { AuthService } from '../../user/shared/services/auth.service';
import { PostTrackAnalysisRequest, PostTrackRequest } from '../shared/models/spotify-models';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';

@Component({
  selector: 'app-audio-library',
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


    
  ],
  templateUrl: './audio-library.component.html',
  styleUrl: './audio-library.component.css',
  providers: [
    ConfirmationService
  ]
})
export class AudioLibraryComponent implements OnInit {
  isLoading: boolean = false;
  plNameVisible: boolean = false;
  playlistName: string = '';
  selectedTracksList: any[] = [];
  audioTracks: any[] = [];
  limit: number = 10;
  showSummaryGraph: boolean = false;
  showDetailedGraph: boolean = false;
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
  data: any;
  data2: any;
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
  pattern = '\\S+.*';
  reOrderedTracks: string[] = [];
  @ViewChild('tableRef') tableRef!: Table;
  tracksListVisible: boolean = false;
  selectedPlaylist: any;
  userPlaylists: any[] = [];
  multiSortMeta!: any[];




  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
  ) {
    //this.spotifyAuthService.refreshSpotifyAccessToken();
    this.getAllAudio()
  }

  ngOnInit(): void {

  }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  getAllAudio() {
    this.isLoading = true;
    this.spotifyService.getAllTracks().subscribe((tracksResponse) => {
      if (tracksResponse.statusCode === 200) {
        this.audioTracks = tracksResponse.payload.map((pltrack: any) => {
          pltrack.jsonData.artist = pltrack.jsonData.artists[0].name
          pltrack.jsonData.color = Constants.generateRandomPrimeNGColor();
          pltrack.jsonData.duration = Constants.formatMilliseconds(pltrack.jsonData.duration_ms);
          return pltrack.jsonData
        });
        console.log('this.audioTracks', this.audioTracks);

        this.isLoading = false;
      }
    });

    this.isLoading = false;

    // this.spotifyService.getSpotifyRecentlyPlayedLimitUrl(this.limit).subscribe((urlResponse) => {
    //   if (urlResponse.statusCode === 200) {

    //     var recentAudioUrl = urlResponse.payload;
    //     const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    //     this.spotifyService.SpotifyCommonGetApi(recentAudioUrl, spotifyAccessToken).subscribe((audioResponse) => {

    //       this.audioTracks = audioResponse.items;
    //       console.log('hisotryTracks', this.audioTracks);


    //       this.audioTracks.forEach(pltrack => {
    //         pltrack.artist = pltrack?.artists[0]?.name;
    //         pltrack.color = Constants.generateRandomPrimeNGColor();
    //         // audio features
    //         this.spotifyService.getTrackById(pltrack.id).subscribe((dbTrackRes) => {
    //           if (dbTrackRes.statusCode === 200) {
    //             //console.log('track found', dbTrackRes.payload.jsonData.audio_features);
    //             pltrack.audio_features = dbTrackRes.payload.jsonData.audio_features;
    //           } else {
    //             //console.log('track not found');
    //             this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.id).subscribe((res) => {
    //               if (res.statusCode === 200) {
    //                 var featuresUrl = res.payload;
    //                 const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    //                 this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
    //                   pltrack.audio_features = res;

    //                 });
    //               };
    //             });
    //           };
    //         });
    //         //To get track analysis
    //         this.spotifyService.getTrackAnalysisById(pltrack.id).subscribe((taRes) => {
    //           if (taRes.statusCode === 200) {

    //             //console.log('track analysis found', taRes.payload.analysisJsonData);
    //             pltrack.audioAnalysis = taRes.payload.analysisJsonData;
    //           } else {
    //             //console.log('track analysis not found');
    //             //To fetch track analysis
    //             this.spotifyService.getSpotifyAudioAnalysisUrl(pltrack.id).subscribe((res) => {
    //               if (res.statusCode === 200) {
    //                 var analysisUrl = res.payload;
    //                 const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    //                 this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((res) => {
    //                   pltrack.audioAnalysis = res;
    //                 });
    //               };
    //             });
    //           };
    //         });
    //       });
    //       setTimeout(() => {
    //         this.isLoading = false;
    //       }, 5000);
    //     })
    //   };
    // })
  }

  onPageChange(event: any) {
    this.showDetailedGraph = false;
    this.showSummaryGraph = false;
    this.limit = event.rows;
    this.getAllAudio();
  }


  rowSelectionEvent() {
    // console.log('this.selectedTrackIds', this.selectedTrackIds);
    this.showDetailedGraph = false;
    this.showSummaryGraph = false;
  }

  getSegmentColor(ctx: any, datasetIndex: number, data: any) {
    const { p0 } = ctx;
    const index = p0.parsed.x;  // Index of the current data point
    const color = data.datasets[datasetIndex].colors[index];  // Get color for the segment

    //return color ;  // Default color if not set
    return this.documentStyle.getPropertyValue(color);
  }

  showSummaryGraphChanged() {
    this.showSummaryGraph = !this.showSummaryGraph;
    this.showDetailedGraph = false;
    if (this.showSummaryGraph) {
      this.isLoading = true;
      this.data2 = {
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
              borderColor: (ctx: any) => this.getSegmentColor(ctx, 0, this.data2)  // Pass dataset index to getSegmentColor
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
              borderColor: (ctx: any) => this.getSegmentColor(ctx, 1, this.data2)  // Pass dataset index to getSegmentColor
            }
          },
          {
            label: 'Energy',
            data: [0],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--red-500'),
            tension: 0.4,
            tracks: [''],
            colors: [],  // Add an array to store color information
            segment: {
              borderColor: (ctx: any) => this.getSegmentColor(ctx, 2, this.data2)  // Pass dataset index to getSegmentColor
            }
          },
          {
            label: 'Danceability',
            data: [0],
            fill: false,
            borderColor: this.documentStyle.getPropertyValue('--green-500'),
            tension: 0.4,
            tracks: [''],
            colors: [],  // Add an array to store color information
            segment: {
              borderColor: (ctx: any) => this.getSegmentColor(ctx, 3, this.data2)  // Pass dataset index to getSegmentColor
            }
          }
        ]
      };
      var durationSum = 0;
      if (this.selectedTracksList.length > 0) {
        // this.selectedTrackIds = Array.from(new Set(this.selectedTrackIds));
        var selectedTracks = this.audioTracks?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
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
          this.data2.datasets[0].tracks.push(pltrack.name);
          this.data2.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data2.datasets[1].data.push(pltrack.audio_features.loudness);
          this.data2.datasets[1].tracks.push(pltrack.name);
          this.data2.datasets[1].colors.push(pltrack.color);
          //energy
          this.data2.datasets[2].data.push(pltrack.audio_features.energy);
          this.data2.datasets[2].tracks.push(pltrack.name);
          this.data2.datasets[2].colors.push(pltrack.color);
          //danceability
          this.data2.datasets[3].data.push(pltrack.audio_features.danceability);
          this.data2.datasets[3].tracks.push(pltrack.name);
          this.data2.datasets[3].colors.push(pltrack.color);
        });
        console.log('this.data2', this.data2);
        this.isLoading = false;
      } else {
        this.audioTracks.forEach(pltrack => {
          durationSum = durationSum + ((pltrack.audio_features?.duration_ms));
          //duration
          this.data2.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
          //tempo
          this.data2.datasets[0].data.push(pltrack.audio_features?.tempo);
          this.data2.datasets[0].tracks.push(pltrack.name);
          this.data2.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data2.datasets[1].data.push(pltrack.audio_features?.loudness);
          this.data2.datasets[1].tracks.push(pltrack.name);
          this.data2.datasets[1].colors.push(pltrack.color);
          //energy
          this.data2.datasets[2].data.push(pltrack.audio_features?.energy);
          this.data2.datasets[2].tracks.push(pltrack.name);
          this.data2.datasets[2].colors.push(pltrack.color);
          //danceability
          this.data2.datasets[3].data.push(pltrack.audio_features?.danceability);
          this.data2.datasets[3].tracks.push(pltrack.name);
          this.data2.datasets[3].colors.push(pltrack.color);
        });
        //console.log('this.data2',this.data2);
        this.isLoading = false;
      }
    }
  }

  showGraphChanged() {
    this.showDetailedGraph = !this.showDetailedGraph;
    this.showSummaryGraph = false;
    if (this.showDetailedGraph) {
      if (this.selectedTracksList.length > 0) {
        //this.selectedTrackIds = Array.from(new Set(this.selectedTrackIds));
        var selectedTracks = this.audioTracks?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
        selectedTracks = selectedTracks.reduce((acc, current) => {
          const x = acc.find((item: any) => item.track.id === current.track.id);
          if (!x) {
            acc.push(current);
          }
          return acc;
        }, []);
        this.generateChart(selectedTracks);
      } else {
        this.generateChart(this.audioTracks);
      }

    };
  }

  navigateToTrackDetails(trackName: string, trackId: string) {
    sessionStorage.setItem('track-name', trackName);
    sessionStorage.setItem('track-id', trackId);
    this.router.navigate(['/spotify/audio-details']);
  }

  generateChart(playlistTracks: any[]) {
    this.isLoading = true;
    this.showDetailedGraph = false;
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
        pltrack.audioAnalysis?.sections?.forEach((section: any) => {
          durationSum = durationSum + ((section.duration) * 1000);
          //duration
          this.data.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
          //tempo
          this.data.datasets[0].data.push(section.tempo);
          this.data.datasets[0].tracks.push(pltrack.name);
          this.data.datasets[0].colors.push(pltrack.color);
          //loudness
          this.data.datasets[1].data.push(section.loudness);
          this.data.datasets[1].tracks.push(pltrack.name);
          this.data.datasets[1].colors.push(pltrack.color);
        });
      });
      this.isLoading = false;
      this.showDetailedGraph = true;
      //console.log('data', this.data);
    }, 3000);
  }

  tableReordered(event: any) {
    this.reOrderedTracks = [];
    this.showDetailedGraph = false;
    this.showSummaryGraph = false;

    // Remove the item from the drag index and insert it at the drop index
    const movedItem = this.audioTracks.splice(event.dragIndex, 1)[0];  // Remove the item at dragIndex
    this.audioTracks.splice(event.dropIndex, 0, movedItem);  // Insert the moved item at dropIndex

    this.audioTracks.forEach(pltrack => {
      this.reOrderedTracks.push(pltrack.id)
    });
  }

  tableSorted(event: any) {
    // console.log('Table sorted :',event);
    let field = event.field;
    let order = event.order;
    this.reOrderedTracks = [];
    this.showDetailedGraph = false;
    this.showSummaryGraph = false;

    const getFieldValue = (obj: any, field: string) => {
      return field.split('.').reduce((value, key) => value ? value[key] : undefined, obj);
    };

    this.audioTracks.sort((a, b) => {
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
    this.audioTracks.forEach(pltrack => {
      this.reOrderedTracks.push(pltrack?.id)
    });
  }

  selectAllClicked() {
    this.showDetailedGraph = false;
    this.showSummaryGraph = false;

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
                if (ploResponse.statusCode === 200) {
                  let plOpsUrl = ploResponse.payload;
                  let plOpsBody: any = {
                    uris: [],
                    position: 0
                  };

                  this.selectedTracksList.forEach(selectedTrack => {
                    plOpsBody.uris.push(`spotify:track:${selectedTrack.track.id}`)
                  });

                  //to store all the selected tracks in db
                  this.saveSelectedTracks();

                  setTimeout(() => {
                    this.spotifyService.SpotifyCommonPostApi(plOpsUrl, plOpsBody, spotifyAccessToken).subscribe((addedItemsResponse) => {
                      // console.log(addedItemsResponse);
                      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New playlist created successfully.' });
                      this.router.navigate(['/spotify/playlists']);
                    });
                  }, 4000);

                };
              });
            });
          };
        });
      }
    })
  }

  saveSelectedTracks() {
    var selectedTracks = this.audioTracks?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
    selectedTracks = selectedTracks.reduce((acc, current) => {
      const x = acc.find((item: any) => item.track.id === current.track.id);
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);

    selectedTracks.forEach((pltrack) => {
      //To get Track features from DB
      this.spotifyService.getTrackById(pltrack.id).subscribe((dbTrackRes) => {

        if (dbTrackRes.statusCode === 200) {
          //console.log('track found', dbTrackRes.payload.jsonData.audio_features);
          pltrack.audio_features = dbTrackRes.payload.jsonData.audio_features;
        } else {
          //console.log('track not found');
          //debugger;
          //Add track to DB after fetching it's features
          this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audio_features = res;
                //add track to db with it's features
                var trackJson = Constants.typeCastTrackJson(pltrack);
                var postTrackRequest: PostTrackRequest = {
                  providerTrackId: pltrack.id,
                  trackData: JSON.stringify(trackJson)
                };
                this.spotifyService.postTrack(postTrackRequest).subscribe(postTrackRes => {
                  if (postTrackRes.statusCode === 200) {
                    //console.log("track added successfully.", pltrack.name);
                  };
                });
              });
            };
          });
        };
      });
      //To get track analysis
      this.spotifyService.getTrackAnalysisById(pltrack.id).subscribe((taRes) => {

        if (taRes.statusCode === 200) {
          //console.log('track analysis found', taRes.payload.analysisJsonData);
          pltrack.audioAnalysis = taRes.payload.analysisJsonData;

        } else {
          //console.log('track analysis not found');
          //debugger;
          //To fetch track analysis
          this.spotifyService.getSpotifyAudioAnalysisUrl(pltrack.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var analysisUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audioAnalysis = res;
                //To add track analysis
                var trackAnalysis = Constants.typeCastTrackAnalysisJson(pltrack.audioAnalysis);
                var PostTrackAnalysisRequest: PostTrackAnalysisRequest = {
                  providerTrackId: pltrack.id,
                  trackAnalysisData: JSON.stringify(trackAnalysis)
                };
                this.spotifyService.postTrackAnalysis(PostTrackAnalysisRequest).subscribe((postTrackAnalysisResponse) => {
                  if (postTrackAnalysisResponse.statusCode === 200) {
                    //console.log("track analysis added successfully.");

                  };
                });
              });
            };
          });
        };
      });
    });
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
          console.log(this.userPlaylists);
        });
        this.isLoading = false;
      }
    })



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
    console.log('selectedPlaylist', this.selectedPlaylist);
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

  clear(table: Table) {
    table.sortField = 'name';
    table.sortOrder = 1;
    table.clear();
  }

  // tableFiltered(event:any) {
  //   // (onFilter)="tableFiltered($event)"
  //   console.log('tableFiltered :',event);
  // }

  loadData(event: TableLazyLoadEvent) {
    //debugger;
    // event.first = First row offset
    // event.rows = Number of rows per page
    // event.sortField = Field name to sort with
    // event.sortOrder = Sort order as number, 1 for asc and -1 for desc
    // event.filters = Filter metadata
    console.log('Lazy Load Event:', event);
    console.log('multi sort meta:', event.multiSortMeta);
    // Load data here based on event parameters
  }





}
