import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TracksData, TrackType } from '../models/graph-models';
import { Constants } from '../../../shared/Constants';
import { StravaService } from '../../../strava/shared/services/strava.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { error } from 'console';








@Component({
  selector: 'app-track-summary-graph',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    DropdownModule,
    ButtonModule,
    OverlayPanelModule,
    TooltipModule,
    MessagesModule,






  ],
  templateUrl: './track-summary-graph.component.html',
  styleUrl: './track-summary-graph.component.css',
  providers: [MessageService]
})
export class TrackSummaryGraphComponent {
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');

  // dropdown date ranges
  featureRanges: any[] = [
    { name: 'Average', id: 1 },
    { name: 'Min', id: 2 },
    { name: 'Max', id: 3 }
  ];
  selectedDate: any = { name: 'Average', id: 1 };
  chartTitle: string = '';
  //main chart data
  chartData: any;
  chartOptions: any;
  totalTime: any;
  totalTracks: number = 0;
  @Input() tracksData!: TracksData;
  @Input() selectedTracksList!: any[];
  aggregateDistance: number = 0;
  paceText: string = '';
  aggregatePace: string = '00:00:00';
  dynamicMessage: string = '';
  tempoStatCount: number = -1;
  messages: Message[] = [
    { severity: 'warn', detail: 'Audio Active has not collected sufficient data to project statistics.' },
  ];





  constructor(
    private stravaService: StravaService
  ) {

  }



  ngOnInit(): void {
    this.selectedDate = this.featureRanges[0];
    // console.log(this.tracksData);
    switch (this.tracksData.trackType) {
      case TrackType.AudioLibrary:
        this.chartTitle = 'Audio Library';
        break;
      case TrackType.LikedSongs:
        this.chartTitle = 'Liked Songs';
        break;
      case TrackType.PlaylistTracks:
        this.chartTitle = 'Playlist Tracks';
        break;
      case TrackType.RecentlyPlayed:
        this.chartTitle = 'Recently Played';
        // this.tracksData.tracks.forEach(track => {
        //   track.audio_features = track.track.audio_features;
        // });
        break;

      default:
        break;
    };
    this.getTempoStats();

    this.chartOptions = {
      animation: {
        duration: 0
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
            usePointStyle: true,
            boxHeight: 15,
            pointStyleWidth: 17,
            padding: 14
          }
        },
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: this.externalTooltipHandler
        }
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary
          },
          grid: {
            color: this.surfaceBorder
          }
        },
        y: {
          ticks: {
            color: this.textColorSecondary
          },
          grid: {
            color: this.surfaceBorder
          }
        }
      }
    };
    this.showSummaryGraphChanged();
  }

  sortDatasetsByValue(datasets: any) {
    return datasets.sort((a: any, b: any) => Math.max(...a.data) - Math.max(...b.data));
  }

  showSummaryGraphChanged() {
    this.chartData = {
      labels: [],
      datasets: [
        {
          label: 'Energy',
          data: [],
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--teal-700'),
          borderRadius: 8,
          tracks: [],
        },
        {
          label: 'Danceability',
          data: [],
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--teal-500'),
          borderRadius: 8,
          tracks: [],
        },
        {
          label: 'Loudness',
          data: [],
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--teal-300'),
          borderRadius: 8,
          tracks: [],
        },
        {
          label: 'Tempo',
          data: [],
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--teal-100'),
          borderRadius: 8,
          tracks: [],
        }
      ]
    };
    var durationSum = 0;
    if (this.selectedTracksList.length > 0) {
      //For Audio Library only
      // if (this.tracksData.trackType === TrackType.AudioLibrary) {
      //   var selectedTracks = this.tracksData.tracks?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.id === ht.id));
      //   selectedTracks = selectedTracks.reduce((acc, current) => {
      //     const x = acc.find((item: any) => item.id === current.id);
      //     if (!x) {
      //       acc.push(current);
      //     }
      //     return acc;
      //   }, []);
      // } else {
      //   //For Rest of the components
      //   var selectedTracks = this.tracksData.tracks?.filter(ht => this.selectedTracksList.some((selectedTrack: any) => selectedTrack.track.id === ht.track.id));
      //   selectedTracks = selectedTracks.reduce((acc, current) => {
      //     const x = acc.find((item: any) => item.track.id === current.track.id);
      //     if (!x) {
      //       acc.push(current);
      //     }
      //     return acc;
      //   }, []);
      // };

      this.selectedTracksList.forEach((pltrack, index) => {
        // selectedTracks.forEach((pltrack, index) => {
        var eligibleTrack: any;
        if (this.tracksData.trackType === TrackType.AudioLibrary) {
          eligibleTrack = pltrack;
        } else {
          eligibleTrack = pltrack.track;
        };
        durationSum = durationSum + ((pltrack.audio_features.duration_ms));
        this.totalTime = Constants.formatMilliseconds(durationSum);
        //duration
        this.chartData.labels.push(index + 1);
        //tempo
        this.chartData.datasets[3].data.push(pltrack.audio_features.tempo);
        this.chartData.datasets[3].tracks.push(eligibleTrack);
        //loudness
        this.chartData.datasets[2].data.push(pltrack.audio_features.loudness);
        this.chartData.datasets[2].tracks.push(eligibleTrack);
        //energy
        this.chartData.datasets[0].data.push(pltrack.audio_features.energy);
        this.chartData.datasets[0].tracks.push(eligibleTrack);
        //danceability
        this.chartData.datasets[1].data.push(pltrack.audio_features.danceability);
        this.chartData.datasets[1].tracks.push(eligibleTrack);
      });

      // console.log('this.chartData', this.chartData);
    } else {
      var durationSum = 0;
      this.tracksData.tracks.forEach((pltrack, index) => {

        var eligibleTrack: any;
        if (this.tracksData.trackType === TrackType.AudioLibrary) {
          eligibleTrack = pltrack;
        } else {
          eligibleTrack = pltrack.track;

        };

        durationSum = durationSum + ((pltrack.audio_features.duration_ms));
        this.totalTime = Constants.formatMilliseconds(durationSum);
        //duration
        this.chartData.labels.push(index + 1);
        //tempo
        this.chartData.datasets[3].data.push(pltrack.audio_features.tempo);
        this.chartData.datasets[3].tracks.push(eligibleTrack);
        //loudness
        this.chartData.datasets[2].data.push(pltrack.audio_features.loudness);
        this.chartData.datasets[2].tracks.push(eligibleTrack);
        //energy
        this.chartData.datasets[0].data.push(pltrack.audio_features.energy);
        this.chartData.datasets[0].tracks.push(eligibleTrack);
        //danceability
        this.chartData.datasets[1].data.push(pltrack.audio_features.danceability);
        this.chartData.datasets[1].tracks.push(eligibleTrack);
      });
      //console.log('this.chartData',this.chartData);
    };

    this.totalTracks = (this.selectedTracksList.length > 0) ? this.selectedTracksList.length : this.tracksData.tracks.length;
  }


  getTempoStats() {
    var tempos = this.tracksData.tracks.map(track => { return track.audio_features.tempo });
    tempos = [...new Set(tempos)];

    this.stravaService.getTempoStatisticsByMultiTempos(tempos).subscribe((temposRes) => {
      if (temposRes.statusCode === 200) {
        // console.log('tempo stats', temposRes.payload);
        this.tempoStatCount = 0;
        this.tracksData.tracks.forEach(track => {
          var duration_ms = 0;
          if (this.tracksData.trackType === TrackType.AudioLibrary) {
            duration_ms = track.duration_ms;
          } else {
            duration_ms = track.track.duration_ms;
          };

          track.tempoStatistic = temposRes.payload.find((stat: any) => stat.tempo === track.audio_features.tempo);
          if (track.tempoStatistic) {
            track.minDistance = (track.tempoStatistic?.minSpeed * (Constants.convertMsToHours(duration_ms)));
            track.avgDistance = (track.tempoStatistic?.avgSpeed * (Constants.convertMsToHours(duration_ms)));
            track.maxDistance = (track.tempoStatistic?.maxSpeed * (Constants.convertMsToHours(duration_ms)));
          };

          if (this.tracksData.trackType != TrackType.AudioLibrary) {
            track.track.tempoStatistic = track.tempoStatistic;
            track.track.minDistance = track.minDistance;
            track.track.avgDistance = track.avgDistance;
            track.track.maxDistance = track.maxDistance;
          };
        });
        // console.log('modified tracks', this.tracksData.tracks);
        var tempostatTrackCount = (this.tracksData.tracks.filter(track => track.tempoStatistic !== undefined)).length;
        var count = (tempostatTrackCount > this.selectedTracksList.length && (this.selectedTracksList.length != 0)) ? this.selectedTracksList.length : tempostatTrackCount;
        this.tempoStatCount = count;
        this.dynamicMessage = `The Total Distance and ${this.selectedDate.name} Pace corresponds to ${count} track(s).`;


        this.onDateChangeBarChart();
      } else if (temposRes.statusCode === 404) {
        this.tempoStatCount = 0;
      };
    }, error => {
      this.tempoStatCount = 0;
    });
  }



  //sum function for main chart data
  sumOf(array: any[]) {
    let sum: number = 0;
    array.forEach((a) => (sum += a));
    return sum;
  }

  onDateChangeBarChart() {
    switch (this.selectedDate.name) {
      case 'Average':
        this.paceText = 'Avg. Pace';
        this.aggregateDistance = this.tracksData.tracks.reduce((acc, track) => {
          return acc + (track.avgDistance || 0);
        }, 0);
        this.aggregatePace = Constants.sumPace(this.tracksData.tracks, this.selectedDate.name);
        break;
      case 'Min':
        this.paceText = 'Min. Pace';
        this.aggregateDistance = this.tracksData.tracks.reduce((acc, track) => {
          return acc + (track.minDistance || 0);
        }, 0);
        this.aggregatePace = Constants.sumPace(this.tracksData.tracks, this.selectedDate.name);
        break;
      case 'Max':
        this.paceText = 'Max. Pace';
        this.aggregateDistance = this.tracksData.tracks.reduce((acc, track) => {
          return acc + (track.maxDistance || 0);
        }, 0);
        this.aggregatePace = Constants.sumPace(this.tracksData.tracks, this.selectedDate.name);
        break;
      default:
        break;
    };
    this.dynamicMessage = `The Total Distance and ${this.selectedDate.name} Pace corresponds to ${this.tempoStatCount} track(s).`;
  }

  getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
      tooltipEl.style.borderRadius = '12px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .2s ease';
      tooltipEl.style.maxWidth = '200px';
      tooltipEl.style.width = '200px';

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  externalTooltipHandler = (context: any) => {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = this.getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    };

    // Set Text
    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map((b: any) => b.lines);
      const tableHead = document.createElement('thead');
      var trackIndex: number = 0;
      var track: any;

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = '0';

        const th = document.createElement('th');
        th.style.borderWidth = '0';
        trackIndex = (Number(title) - 1);

        th.innerText = context.tooltip.dataPoints[0].dataset.tracks[trackIndex].name;
        track = context.tooltip.dataPoints[0].dataset.tracks[trackIndex];


        if (track.tempoStatistic?.isProjected) {
          // Create a span for the "Projected" tag
          const projectedTag = document.createElement('span');
          projectedTag.innerText = "Projected";
          projectedTag.style.backgroundColor = "green";  // Green background
          projectedTag.style.color = "white";            // White text
          projectedTag.style.padding = "2px 5px";        // Padding for the tag
          projectedTag.style.borderRadius = "3px";       // Rounded corners
          projectedTag.style.marginLeft = "10px";        // Space between name and tag

          // Append the tag to the th element
          th.appendChild(projectedTag);
        };

        tr.appendChild(th);
        tableHead.appendChild(tr);
      });


      const tableBody = document.createElement('tbody');

      const trEmpty = document.createElement('tr');
      trEmpty.innerHTML = `</br>`;
      tableBody.appendChild(trEmpty);

      //for starting time
      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = '0';
      const td = document.createElement('td');
      td.style.borderWidth = '0';
      if (this.tracksData.trackType === TrackType.AudioLibrary) {
        var trackStartTime = trackIndex === 0 ? 0 : this.tracksData.tracks.slice(0, trackIndex).reduce((sum, track) => sum + track.duration_ms, 0);
      } else {
        var trackStartTime = trackIndex === 0 ? 0 : this.tracksData.tracks.slice(0, trackIndex).reduce((sum, track) => sum + track.track.duration_ms, 0);
      }

      const text = document.createTextNode(`Start : ${Constants.formatMilliseconds(trackStartTime)}`);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);

      //For track duration 
      const tr1 = document.createElement('tr1');
      tr1.style.backgroundColor = 'inherit';
      tr1.style.borderWidth = '0';
      tr1.style.paddingBottom = '10px';
      const td1 = document.createElement('td1');
      td.style.borderWidth = '0';
      const text1 = document.createTextNode(`Duration : ${Constants.formatMilliseconds(track.duration_ms)}`);
      td1.appendChild(text1);
      tr1.appendChild(td1);
      tableBody.appendChild(tr1);


      //only if TempoStatistic Exists
      if (track.tempoStatistic) {
        var distance: number = 0;
        var pace: string = '';
        var speed: number = 0;
        switch (this.selectedDate.name) {
          case 'Average':
            distance = track.avgDistance;
            pace = track.tempoStatistic.avgPace;
            speed = track.tempoStatistic.avgSpeed;
            break;
          case 'Min':
            distance = track.minDistance;
            pace = track.tempoStatistic.minPace;
            speed = track.tempoStatistic.minSpeed;
            break;
          case 'Max':
            distance = track.maxDistance;
            pace = track.tempoStatistic.maxPace;
            speed = track.tempoStatistic.maxSpeed;
            break;
          default:
            break;
        };
        distance = parseFloat(distance.toFixed(2));
        speed = parseFloat(speed.toFixed(2));

        //For Distance 
        const trDist = document.createElement('tr');
        trDist.style.backgroundColor = 'inherit';
        trDist.style.borderWidth = '0';
        trDist.style.paddingBottom = '10px';
        const tdDist = document.createElement('td');
        td.style.borderWidth = '0';
        const textD = document.createTextNode(`Distance : ${distance} km`);
        tdDist.appendChild(textD);
        trDist.appendChild(tdDist);
        tableBody.appendChild(trDist);

        //For Pace 
        const trPace = document.createElement('tr');
        trPace.style.backgroundColor = 'inherit';
        trPace.style.borderWidth = '0';
        trPace.style.paddingBottom = '10px';
        const tdPace = document.createElement('td');
        td.style.borderWidth = '0';
        const textP = document.createTextNode(`Pace : ${pace} /km`);
        tdPace.appendChild(textP);
        trPace.appendChild(tdPace);
        tableBody.appendChild(trPace);

        //For Speed 
        const trSpeed = document.createElement('tr');
        trSpeed.style.backgroundColor = 'inherit';
        trSpeed.style.borderWidth = '0';
        trSpeed.style.paddingBottom = '10px';
        const tdSpeed = document.createElement('td');
        td.style.borderWidth = '0';
        const textS = document.createTextNode(`Speed : ${speed} km/hr`);
        tdSpeed.appendChild(textS);
        trSpeed.appendChild(tdSpeed);
        tableBody.appendChild(trSpeed);

      };



      const tableFooter = document.createElement('tfooter');
      const trFooter = document.createElement('tr');
      trFooter.innerHTML = `</br>`;
      tableFooter.appendChild(trFooter);
      //for features
      bodyLines.forEach((body: any, i: any) => {
        const colors = tooltip.labelColors[i];
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = colors.borderColor;
        span.style.borderWidth = '2px';
        span.style.marginRight = '10px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';
        const trFooter = document.createElement('tr');
        trFooter.style.backgroundColor = 'inherit';
        trFooter.style.borderWidth = '0';
        const td = document.createElement('td');
        td.style.borderWidth = '0';
        const text = document.createTextNode(body);
        td.appendChild(span);
        td.appendChild(text);
        trFooter.appendChild(td);
        tableFooter.appendChild(trFooter);
      });

      const tableRoot = tooltipEl.querySelector('table');

      // Remove old children
      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }

      // Add new children
      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
      tableRoot.appendChild(tableFooter);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };









}
