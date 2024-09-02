import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { Constants } from '../../shared/Constants';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../user/shared/services/auth.service';







@Component({
  selector: 'app-playlist-details',
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
    InputTextModule



  ],
  templateUrl: './playlist-details.component.html',
  styleUrl: './playlist-details.component.css',
  providers: [
    ConfirmationService
  ]
})
export class PlaylistDetailsComponent implements OnInit {
  audioFeatures: any[] = [];
  playlistTracks: any[] = [];
  currentPlayListName: string = '';
  currentTrackName = '';
  showAudioFeatures: boolean = false;
  checkInterval: any;
  isLoading: boolean = false;
  data: any;
  showGraph: boolean = false;
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



  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.fetchThirdPartyDetails();
    this.startCheckingToken();
  }

  ngOnInit(): void {

  }

  getSegmentColor(ctx: any, datasetIndex: number) {
    const { p0 } = ctx;
    const index = p0.parsed.x;  // Index of the current data point
    const color = this.data.datasets[datasetIndex].colors[index];  // Get color for the segment

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
        this.getPlayListTracks();
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

  getPlayListTracks() {
    // this.isLoading = true;
    this.playlistTracks = [];
    this.spotifyAuthService.refreshSpotifyAccessToken();
    var url = sessionStorage.getItem('playlist-items-url') || '';
    var playlistName = sessionStorage.getItem('playlist-name') || '';

    this.currentPlayListName = playlistName;
    const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
      this.isLoading = true;
      this.spotifyService.SpotifyCommonGetApi(url, spotifyAccessToken).subscribe((resp) => {
        this.playlistTracks = resp.items;
        this.playlistTracks.forEach(plTrack => {
          this.originalTracks.push(plTrack.track.id)
        });
        console.log('this.originalTracks', this.originalTracks);

        // To assign Audio Features to the track
        this.playlistTracks.forEach((pltrack) => {
          pltrack.color = Constants.generateRandomPrimeNGColor();
          this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audioFeatures = res;

                this.spotifyService.getSpotifyAudioAnalysisUrl(pltrack.track.id).subscribe((res) => {
                  if (res.statusCode === 200) {
                    var analysisUrl = res.payload;
                    const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
                    this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((res) => {
                      pltrack.audioAnalysis = res;
                    });
                  }
                });

              });
            }
          });
        });

        this.generateChart(this.playlistTracks);
      });
    };
  }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  backToPlaylists() {
    //   this.closeEvent.emit(false);
    this.router.navigate(['/spotify/playlists'])
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
    this.isLoading=true;
    var playlistId = sessionStorage.getItem('playlist-id') || '';
    this.spotifyService.getPlaylistOpsUrl(playlistId).subscribe((res) => {
      if (res.statusCode === 200) {
        var opsUrl = res.payload;
        //console.log(opsUrl);
        let removeItemsBody: any = {
          tracks: [],
          snapshot_id: sessionStorage.getItem('playlist-snapshot-id')
        };
        this.originalTracks.forEach(trackId => {
          let bodyItem = {
            uri: `spotify:track:${trackId}`
          };
          removeItemsBody.tracks.push(bodyItem);
        });
        const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
        debugger;
        this.spotifyService.SpotifyCommonDeleteApi(opsUrl, removeItemsBody,spotifyAccessToken).subscribe((removeItemsRes) => {
          
          //Code to add new items to the playlist
          let plOpsBody: any = {
            uris: [],
            position: 0
          };
          if (this.reOrderedTracks.length != 0) {
            this.reOrderedTracks.forEach(trackId => {
              plOpsBody.uris.push(`spotify:track:${trackId}`)
            });
          } else {
            this.originalTracks.forEach(trackId => {
              plOpsBody.uris.push(`spotify:track:${trackId}`)
            });
          }
          this.spotifyService.SpotifyCommonPostApi(opsUrl, plOpsBody, spotifyAccessToken).subscribe((addedItemsResponse) => {
           
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Changes updated successfully.' });
            this.router.navigate(['/spotify/playlists']);
          })


        })

      }
    })
  }

  tableReordered() {
    this.reOrderedTracks = [];
    console.log('Reordered', this.playlistTracks);
    this.generateChart(this.playlistTracks);
    this.playlistTracks.forEach(plTrack => {
      this.reOrderedTracks.push(plTrack.track.id)
    });
    console.log('this.reOrderedTracks', this.reOrderedTracks);
  }

  generateChart(playlistTracks: any[]) {
    this.isLoading = true;
    this.showGraph = false;
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
          tracks: [],
          colors: [],  // Add an array to store color information
          segment: {
            borderColor: (ctx: any) => this.getSegmentColor(ctx, 0)  // Pass dataset index to getSegmentColor
          }
        },
        {
          label: 'Loudness',
          data: [0],
          fill: false,
          borderColor: this.documentStyle.getPropertyValue('--orange-500'),
          tension: 0.4,
          tracks: [],
          colors: [],  // Add an array to store color information
          segment: {
            borderColor: (ctx: any) => this.getSegmentColor(ctx, 1)  // Pass dataset index to getSegmentColor
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
      this.isLoading = false;
      this.showGraph = true;
      console.log('data', this.data);
    }, 3000);
  }

  createNewPlaylist() {
    this.plNameVisible = false;
    this.isLoading = true;
    var userId = this.authService.getUserIdFromToken();
    this.spotifyService.getSpotifyUser(userId).subscribe((mapRes) => {
      if (mapRes.statusCode === 200) {
        console.log(mapRes);
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
                  if (this.reOrderedTracks.length != 0) {
                    this.reOrderedTracks.forEach(trackId => {
                      plOpsBody.uris.push(`spotify:track:${trackId}`)
                    });
                  } else {
                    this.originalTracks.forEach(trackId => {
                      plOpsBody.uris.push(`spotify:track:${trackId}`)
                    });
                  }
                  this.spotifyService.SpotifyCommonPostApi(plOpsUrl, plOpsBody, spotifyAccessToken).subscribe((addedItemsResponse) => {
                    console.log(addedItemsResponse);
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
































}
