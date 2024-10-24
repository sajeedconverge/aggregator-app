import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StravaService } from '../../../strava/shared/services/strava.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Constants } from '../../../shared/Constants';
import { ProgressBarComponent } from '../../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'app-projections-graph',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    ProgressBarComponent,



  ],
  templateUrl: './projections-graph.component.html',
  styleUrl: './projections-graph.component.css'
})
export class ProjectionsGraphComponent implements OnInit {
  tracks: any[] = this.config.data.tracks;
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
  options: any;
  data: any = {
    labels: [],
    indexes: [],
    datasets: [
      {
        label: 'Min Distance',
        data: [],
        fill: false,
        borderColor: this.documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4,
        pointBackgroundColor: '#000000',
        pointBorderColor: '#000000',
        tracks: [],
        
      },
      {
        label: 'Avg Distance',
        data: [],
        fill: false,
        borderColor: this.documentStyle.getPropertyValue('--orange-500'),
        tension: 0.4,
        pointBackgroundColor: '#000000',
        pointBorderColor: '#000000',
        tracks: [],
      },
      {
        label: 'Max Distance',
        data: [],
        fill: false,
        borderColor: this.documentStyle.getPropertyValue('--red-500'),
        tension: 0.4,
        pointBackgroundColor: '#000000',
        pointBorderColor: '#000000',
        tracks: [],
      }
    ]
  };
  isLoading: boolean = false;






  constructor(
    public dynamicDialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private stravaService: StravaService
  ) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    // console.log(this.tracks);
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
          enabled: false,
          position: 'nearest',
          external: this.externalTooltipHandler
        },

        // tooltip: {
        //   callbacks: {
        //     // Customize the label in the tooltip
        //     label: function (context: any) {
        //       debugger;
        //       return `Track name: ${context.dataset.tracks[context.parsed.x].track.name} ` +
        //         `Track tempo: ${context.dataset.tracks[context.parsed.x].audio_features.tempo} ` +
        //         `${context.dataset.label}: ${context.raw}`;
        //     },
        //   },
        // },

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
    this.getTrackStats();
  }

  getTrackStats() {
    this.tracks.forEach((track,index) => {

      this.stravaService.getTempoStatisticsByTempo(track.audio_features.tempo).subscribe((tempoRes) => {
        if (tempoRes.statusCode === 200) {
          track.tempoStatistics = tempoRes.payload;

          track.pace = track.tempoStatistics.avgPace
          track.minDistance = (track.tempoStatistics.minSpeed * (Constants.convertMsToHours(track.track.duration_ms
          )));
          track.avgDistance = (track.tempoStatistics.avgSpeed * (Constants.convertMsToHours(track.track.duration_ms
          )));
          track.maxDistance = (track.tempoStatistics.maxSpeed * (Constants.convertMsToHours(track.track.duration_ms
          )));

          //Indexes
          this.data.indexes.push(index);

          //Pace
          this.data.labels.push(track.pace);
          //tempo
          this.data.datasets[0].data.push(track.minDistance);
          this.data.datasets[0].tracks.push(track);

          //loudness
          this.data.datasets[1].data.push(track.avgDistance);
          this.data.datasets[1].tracks.push(track);

          //energy
          this.data.datasets[2].data.push(track.maxDistance);
          this.data.datasets[2].tracks.push(track);


          setTimeout(() => {
            this.isLoading = false;
          }, 1500);

        };

      })
    });

    // console.log('data', this.data);
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

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  externalTooltipHandler = (context: any) => {
    // Tooltip Element
    const {  chart, tooltip } = context;
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
        trackIndex = (context.tooltip.dataPoints[0].dataIndex)
        th.innerText = context.tooltip.dataPoints[0].dataset.tracks[trackIndex].track.name;
        track = context.tooltip.dataPoints[0].dataset.tracks[trackIndex];

        //const text = document.createTextNode(title);

        //th.appendChild(text);
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
      var trackStartTime =  0 ;
      const text = document.createTextNode(`Tempo : ${track.audio_features.tempo}`);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);

      // //For track duration 
      // const tr1 = document.createElement('tr1');
      // tr1.style.backgroundColor = 'inherit';
      // tr1.style.borderWidth = '0';
      // tr1.style.paddingBottom = '10px';
      // const td1 = document.createElement('td1');
      // td.style.borderWidth = '0';
      // const text1 = document.createTextNode(`Duration : ${Constants.formatMilliseconds(track.duration_ms)}`);
      // td1.appendChild(text1);
      // tr1.appendChild(td1);
      // tableBody.appendChild(tr1);

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
        const text = document.createTextNode(`${body} km`);
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
