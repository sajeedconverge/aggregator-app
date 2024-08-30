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
import { log } from 'console';

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
    InputSwitchModule
  ],
  templateUrl: './playlist-details.component.html',
  styleUrl: './playlist-details.component.css'
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
  options: any;
  showGraph: boolean = false;
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');


  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router
  ) {
    this.fetchThirdPartyDetails();
    this.startCheckingToken();
  }

  ngOnInit(): void {
    

    // this.data = {
    //   labels: ['0:00:00'],
    //   datasets: [
    //     {
    //       label: 'Tempo',
    //       data: [0],
    //       fill: false,
    //       borderColor: this.documentStyle.getPropertyValue('--blue-500'),
    //       tension: 0.4,
    //       tracks: [],
    //       colors: [],  // Add an array to store color information
    //       segment: {
    //         borderColor: (ctx: any) => this.getSegmentColor(ctx, 0)  // Pass dataset index to getSegmentColor
    //       }
    //     },
    //     {
    //       label: 'Loudness',
    //       data: [0],
    //       fill: false,
    //       borderColor: this.documentStyle.getPropertyValue('--orange-500'),
    //       tension: 0.4,
    //       tracks: [],
    //       colors: [],  // Add an array to store color information
    //       segment: {
    //         borderColor: (ctx: any) => this.getSegmentColor(ctx, 1)  // Pass dataset index to getSegmentColor
    //       }
    //     }
    //   ]
    // };

    this.options = {
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

        console.log('original', this.playlistTracks);
        var durationSum = 0;
        setTimeout(() => {
          
          this.playlistTracks.forEach(pltrack => {
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

          

          console.log('data',this.data);
          
          this.isLoading = false;
          this.showGraph = true;
        }, 2000);

        // console.log('data', this.data);
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

  updatePlaylist() {
    console.log('Reordered', this.playlistTracks);
  }

  tableReordered() {
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
    console.log('Reordered', this.playlistTracks);

    var durationSum = 0;
    setTimeout(() => {
      this.playlistTracks.forEach(pltrack => {
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
      this.showGraph = true;
    }, 2000);
  }
}
