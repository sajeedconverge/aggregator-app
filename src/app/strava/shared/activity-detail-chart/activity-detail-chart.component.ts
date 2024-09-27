import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { Constants } from '../../../shared/Constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-detail-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    DropdownModule,

  ],
  templateUrl: './activity-detail-chart.component.html',
  styleUrl: './activity-detail-chart.component.css'
})
export class ActivityDetailChartComponent implements OnInit {
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');

  // // dropdown date ranges
  // featureRanges: any[] = [
  //   { name: 'Average', code: 'DAY' },
  //   { name: 'Min', code: 'WEEK' },
  //   { name: 'Max', code: 'MONTH' }
  // ];
  // selectedDate: any;

  chartTitle: string = '';
  chartData: any;
  chartOptions: any;
  totalTime: any;
  totalTracks: number = 0;
  totalDistance:number=0;
  averagePace:string='';

  @Input() activityDetails!: any;
  @Input() pairedTracks!: any[];






  constructor() { }

  ngOnInit(): void {
    console.log("chart activityDetails", this.activityDetails);
    console.log("chart pairedTracks", this.pairedTracks);

    this.chartTitle = this.activityDetails.name;
    this.totalTime=Constants.formatDuration(this.activityDetails.elapsed_time*1000);
    this.totalTracks = this.pairedTracks.length;
    this.totalDistance=(this.activityDetails.distance/1000);

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
    this.populateGraph();
  }

  populateGraph(){
    var totalPaceMs = 0;
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
    //to populate graph
    this.pairedTracks.forEach((pltrack, index) => {
      if(isNaN(pltrack.track.duration_ms)) {
        pltrack.track.duration_ms=Constants.convertToMilliseconds(pltrack.track.duration_ms) ;
      } ;
      if(!pltrack.track.audio_features){
        pltrack.track.audio_features=pltrack.audio_features;
        pltrack.track = Constants.typeCastTrackJson(pltrack);
      }
      //duration
      this.chartData.labels.push(index + 1);
      //tempo
      this.chartData.datasets[3].data.push(pltrack.track.audio_features.tempo);
      this.chartData.datasets[3].tracks.push(pltrack.track);
      //loudness
      this.chartData.datasets[2].data.push(pltrack.track.audio_features.loudness);
      this.chartData.datasets[2].tracks.push(pltrack.track);
      //energy
      this.chartData.datasets[0].data.push(pltrack.track.audio_features.energy);
      this.chartData.datasets[0].tracks.push(pltrack.track);
      //danceability
      this.chartData.datasets[1].data.push(pltrack.track.audio_features.danceability);
      this.chartData.datasets[1].tracks.push(pltrack.track);

      //calculate pace
      totalPaceMs += Constants.convertToMilliseconds(pltrack.pace);
    });
    this.averagePace=Constants.formatMilliseconds( (totalPaceMs/this.totalTracks) );
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
        trackIndex = (Number(title) - 1)
        th.innerText = context.tooltip.dataPoints[0].dataset.tracks[trackIndex].name;
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
      var trackStartTime = trackIndex === 0 ? 0 : this.pairedTracks.slice(0, trackIndex).reduce((sum, track) => sum + track.track.duration_ms, 0);
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



  // onDateChangeBarChart(){}

}
