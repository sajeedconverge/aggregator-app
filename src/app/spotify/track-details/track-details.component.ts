import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { StravaService } from '../../strava/shared/services/strava.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { Router } from '@angular/router';
import { Constants } from '../../shared/Constants';

@Component({
  selector: 'app-track-details',
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
  templateUrl: './track-details.component.html',
  styleUrl: './track-details.component.css'
})
export class TrackDetailsComponent implements OnInit {
  isLoading: boolean = false;
  trackId: string = '';
  trackName: string = '';
  activityDetails: any[] = [];
  trackDetails: any[] = [];
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
  data1: any;
  data2: any;
  options1: any = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: this.textColor
        }
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
  options2: any = {
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
           // console.log('context',context);
            return `Pace - ${context.formattedValue} /km`; // Customize label
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
  showFeaturesGraph: boolean = false;
  showPaceGraph: boolean = false;
  trackAnalysis: any;


  constructor(
    private stravaService: StravaService,
    private spotifyService: SpotifyService,
    private router: Router
  ) {
    this.trackId = sessionStorage.getItem('track-id') || '';
    this.trackName = sessionStorage.getItem('track-name') || '';
  }

  ngOnInit(): void {
    this.getTrackHistory();
    this.getTrackAnalysis();
  }

  getTrackHistory() {
    this.isLoading=true;
    this.stravaService.getActivityDetailsByTrackId(this.trackId).subscribe((historyResponse) => {
      if (historyResponse.statusCode === 200) {
        this.activityDetails = historyResponse.payload;
        this.activityDetails.forEach(ad => {
          ad.jsonData.audio.forEach((track: any) => {
            if (track.trackid === this.trackId) {
              this.trackDetails.push(track);
              this.data2 = {
                labels: ['0:00:00'],
                datasets: [
                  {
                    label: 'Pace',
                    data: [0],
                    fill: false,
                    borderColor: this.documentStyle.getPropertyValue('--red-500'),
                    tension: 0.4,
                  }
                ]
              };
              // //to plot the pace chart
              // //duration
              // this.data2.labels.push(`${new Date(track.start_time)}`);
              // //tempo
              // this.data2.datasets[0].data.push(track.pace);


              // to plot the pace chart
              // Convert pace string to a numerical value for plotting
              const convertPaceToNumber = (pace: string): number => {
                // Assuming pace format is "mm:ss" (minutes:seconds)
                const parts = pace.split(':').map(part => parseInt(part, 10));
                // Convert to total seconds
                return (parts[0] * 60) + parts[1];
              };

              // Add duration to labels
              this.data2.labels.push(`${new Date(track.start_time).toLocaleString('en-US', {
                weekday: 'short', // e.g., 'Mon'
                year: 'numeric',  // e.g., '2023'
                month: 'short',   // e.g., 'Sep'
                day: 'numeric',   // e.g., '3'
                hour: '2-digit',  // e.g., '08'
                minute: '2-digit',// e.g., '07'
                second: '2-digit' // e.g., '05'
              })}`);

              // Convert pace to numerical value and add to data
              const paceNumber = convertPaceToNumber(track.pace);
              this.data2.datasets[0].data.push(paceNumber);
            }
          })
        });
        this.showPaceGraph = true;
        console.log('this.data2', this.data2);

        console.log('this.trackDetails', this.trackDetails);
        this.isLoading=false;
      }
    });
  }

  backToTracks() {
    this.router.navigate(['/spotify/playlist-details']);
  }


  getTrackAnalysis() {
    this.isLoading=true;
    this.spotifyService.getSpotifyAudioAnalysisUrl(this.trackId).subscribe((urlRes) => {
      if (urlRes.statusCode === 200) {
        var analysisUrl = urlRes.payload;
        const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
        this.spotifyService.SpotifyCommonGetApi(analysisUrl, spotifyAccessToken).subscribe((analysisResponse) => {
          this.trackAnalysis = analysisResponse;
          //console.log('this.trackAnalysis', this.trackAnalysis);
          this.data1 = {
            labels: ['0:00:00'],
            datasets: [
              {
                label: 'Tempo',
                data: [0],
                fill: false,
                borderColor: this.documentStyle.getPropertyValue('--blue-500'),
                tension: 0.4,

              },
              {
                label: 'Loudness',
                data: [0],
                fill: false,
                borderColor: this.documentStyle.getPropertyValue('--orange-500'),
                tension: 0.4,

              }
            ]
          };
          var durationSum = 0;
          this.trackAnalysis.sections.forEach((section: any) => {
            durationSum = durationSum + ((section.duration) * 1000);
            //duration
            this.data1.labels.push(`${Constants.formatMilliseconds(durationSum)}`);
            //tempo
            this.data1.datasets[0].data.push(section.tempo);
            //loudness
            this.data1.datasets[1].data.push(section.loudness);
          });
          this.showFeaturesGraph = true;
          this.isLoading=false;
        });
      };
    });
  }


























































}
