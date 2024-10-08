import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TracksData, TrackType } from '../models/graph-models';
import { Constants } from '../../../shared/Constants';

@Component({
  selector: 'app-track-summary-graph',
  standalone: true,
  imports: [
    FormsModule,
    ChartModule,
    DropdownModule,



  ],
  templateUrl: './track-summary-graph.component.html',
  styleUrl: './track-summary-graph.component.css'
})
export class TrackSummaryGraphComponent {
  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');

  // dropdown date ranges
  featureRanges: any[] = [
    { name: 'Average', code: 'DAY' },
    { name: 'Min', code: 'WEEK' },
    { name: 'Max', code: 'MONTH' }
  ];
  selectedDate: any;

  chartTitle: string = '';
  //main chart data
  chartData: any;
  chartOptions: any;
  totalTime: any;
  totalTracks: number = 0;

  @Input() tracksData!: TracksData;
  @Input() selectedTracksList!: any[];



  constructor(

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
        break;

      default:
        break;
    };

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
        var eligibleTrack:any;
        if (this.tracksData.trackType === TrackType.AudioLibrary){
          eligibleTrack=pltrack;
        }else{
          eligibleTrack=pltrack.track;
        };
        durationSum = durationSum + ((pltrack.audio_features.duration_ms));
        this.totalTime = Constants.formatMilliseconds(durationSum);
        //duration
        this.chartData.labels.push(index + 1);
        //tempo
        this.chartData.datasets[0].data.push(pltrack.audio_features.tempo);
        this.chartData.datasets[0].tracks.push(eligibleTrack);
        //loudness
        this.chartData.datasets[1].data.push(pltrack.audio_features.loudness);
        this.chartData.datasets[1].tracks.push(eligibleTrack);
        //energy
        this.chartData.datasets[2].data.push(pltrack.audio_features.energy);
        this.chartData.datasets[2].tracks.push(eligibleTrack);
        //danceability
        this.chartData.datasets[3].data.push(pltrack.audio_features.danceability);
        this.chartData.datasets[3].tracks.push(eligibleTrack);
      });

      // console.log('this.chartData', this.chartData);
    } else {
      var durationSum = 0;
      this.tracksData.tracks.forEach((pltrack, index) => {

        var eligibleTrack:any;
        if (this.tracksData.trackType === TrackType.AudioLibrary){
          eligibleTrack=pltrack;
        }else{
          eligibleTrack=pltrack.track;
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
        trackIndex = (Number(title) - 1);
        
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
      if (this.tracksData.trackType === TrackType.AudioLibrary){
        var trackStartTime = trackIndex === 0 ? 0 : this.tracksData.tracks.slice(0, trackIndex).reduce((sum, track) => sum + track.duration_ms, 0);
      }else{
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




































  //sum function for main chart data
  sumOf(array: any[]) {
    let sum: number = 0;
    array.forEach((a) => (sum += a));
    return sum;
  }

  onDateChangeBarChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    // const monthlyData = {
    //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //   datasets: [
    //     {
    //       label: 'Orders',
    //       data: this.orders.monthlyData.orders,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-color'),
    //       borderRadius: 12
    //     },
    //     {
    //       label: 'Units',
    //       data: this.orders.monthlyData.orderUnits,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
    //       borderRadius: 12
    //     }
    //   ]
    // };

    // const dailyData = {
    //   labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
    //   datasets: [
    //     {
    //       label: 'Orders',
    //       data: this.orders.dailyData.orders,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-color'),
    //       borderRadius: 6
    //     },
    //     {
    //       label: 'Units',
    //       data: this.orders.dailyData.orderUnits,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
    //       borderRadius: 6
    //     }
    //   ]
    // };

    // const weeklyData = {
    //   labels: [
    //     'Week 1',
    //     'Week 2',
    //     'Week 3',
    //     'Week 4',
    //     'Week 5',
    //     'Week 6',
    //     'Week 7',
    //     'Week 8',
    //     'Week 9',
    //     'Week 10',
    //     'Week 11',
    //     'Week 12',
    //     'Week 13',
    //     'Week 14',
    //     'Week 15',
    //     'Week 16',
    //     'Week 17',
    //     'Week 18',
    //     'Week 19',
    //     'Week 20',
    //     'Week 21',
    //     'Week 22',
    //     'Week 23',
    //     'Week 24'
    //   ],
    //   datasets: [
    //     {
    //       label: 'Orders',
    //       data: this.orders.weeklyData.orders,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-color'),
    //       borderRadius: 6
    //     },
    //     {
    //       label: 'Units',
    //       data: this.orders.weeklyData.orderUnits,
    //       fill: false,
    //       backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
    //       borderRadius: 6
    //     }
    //   ]
    // };

    // let newBarData = { ...this.chartData };
    // switch (this.selectedDate.name) {
    //   case 'Monthly':
    //     newBarData = monthlyData;
    //     break;
    //   case 'Weekly':
    //     newBarData = weeklyData;
    //     break;
    //   case 'Daily':
    //     newBarData = dailyData;
    //     break;
    //   default:
    //     break;
    // }

    this.chartData = {};
  }



}
