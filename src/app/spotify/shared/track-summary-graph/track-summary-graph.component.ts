import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';

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
  // dropdown date ranges
  dateRanges: any[] = [
    { name: 'Daily', code: 'DAY' },
    { name: 'Weekly', code: 'WEEK' },
    { name: 'Monthly', code: 'MONTH' }
  ];
  selectedDate: any;
  //orders data for main chart
  orders: any = {
    monthlyData: {
      dateRange: 'last 12 month',
      orders: [122, 584, 646, 221, 135, 453, 111, 158, 425, 156, 454, 456],
      orderUnits: [145, 584, 676, 281, 137, 459, 136, 178, 435, 176, 456, 480],
      avarageUnitByOrder: 1.2,
      avarageSalesByOrder: '$28.00',
      totalSales: '$109,788.00'
    },
    weeklyData: {
      dateRange: 'last 24 week',
      orders: [28, 58, 44, 16, 42, 8, 15, 26, 38, 46, 15, 46, 89, 45, 41, 22, 17, 43, 12, 45, 24, 16, 54, 49],
      orderUnits: [32, 62, 48, 19, 49, 10, 16, 26, 38, 54, 19, 52, 100, 53, 41, 22, 26, 43, 18, 47, 29, 18, 62, 51],
      avarageUnitByOrder: 1.2,
      avarageSalesByOrder: '$24.00',
      totalSales: '$20,136.00'
    },
    dailyData: {
      dateRange: 'last 30 days',
      orders: [8, 5, 4, 6, 2, 8, 5, 2, 8, 6, 5, 6, 12, 8, 11, 6, 2, 8, 3, 4, 6, 2, 11, 6, 4, 7, 6, 7, 6, 4],
      orderUnits: [10, 6, 5, 6, 2, 8, 5, 6, 8, 6, 7, 7, 12, 12, 14, 6, 2, 8, 7, 4, 6, 5, 13, 6, 7, 9, 6, 7, 6, 6],
      avarageUnitByOrder: 1.2,
      avarageSalesByOrder: '$29.00',
      totalSales: '$5,162.00'
    }
  };

  //main chart data
  chartData: any;
  chartOptions: any;

  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');



  constructor(

  ) { }



  ngOnInit(): void {
    //main chart
    this.chartData = {
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
      datasets: [
        {
          label: 'Orders',
          data: this.orders.dailyData.orders,
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--primary-color'),
          borderRadius: 6
        },

        {
          label: 'Units',
          data: this.orders.dailyData.orderUnits,
          fill: false,
          backgroundColor: this.documentStyle.getPropertyValue('--primary-light-color'),
          borderRadius: 6
        }
      ]
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
    }

    // Set Text
    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map((b: any) => b.lines);
      const tableHead = document.createElement('thead');

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = '0';

        const th = document.createElement('th');
        th.style.borderWidth = '0';
        th.innerText = this.selectedDate.code == 'DAY' ? 'Day ' : '';
        const text = document.createTextNode(title);

        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });

      const tableBody = document.createElement('tbody');
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

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = '0';
        const td = document.createElement('td');
        td.style.borderWidth = '0';

        const text = document.createTextNode(body);

        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableFooter = document.createElement('tfooter');
      const trFooter = document.createElement('tr');
      trFooter.style.backgroundColor = 'inherit';
      trFooter.style.borderWidth = '0';
      trFooter.innerHTML =
        `</br> <span> Avarage Unit/Order: </span>
        </br> <b>` +
        (this.selectedDate.code == 'DAY' ? this.orders.dailyData.avarageUnitByOrder : this.selectedDate.code == 'WEEK' ? this.orders.weeklyData.avarageUnitByOrder : this.orders.monthlyData.avarageUnitByOrder) +
        `</b></br></br> ` +
        `<span> Avarage Sales/Order: </span>
        </br> <b>` +
        (this.selectedDate.code == 'DAY' ? this.orders.dailyData.avarageSalesByOrder : this.selectedDate.code == 'WEEK' ? this.orders.weeklyData.avarageSalesByOrder : this.orders.monthlyData.avarageSalesByOrder) +
        `</b></br></br> ` +
        `<span> Total Sales: </span>
        </br> <b>` +
        (this.selectedDate.code == 'DAY' ? this.orders.dailyData.totalSales : this.selectedDate.code == 'WEEK' ? this.orders.weeklyData.totalSales : this.orders.monthlyData.totalSales) +
        `</b>`;
      tableFooter.appendChild(trFooter);

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
    const monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Orders',
          data: this.orders.monthlyData.orders,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderRadius: 12
        },
        {
          label: 'Units',
          data: this.orders.monthlyData.orderUnits,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
          borderRadius: 12
        }
      ]
    };

    const dailyData = {
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
      datasets: [
        {
          label: 'Orders',
          data: this.orders.dailyData.orders,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderRadius: 6
        },
        {
          label: 'Units',
          data: this.orders.dailyData.orderUnits,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
          borderRadius: 6
        }
      ]
    };

    const weeklyData = {
      labels: [
        'Week 1',
        'Week 2',
        'Week 3',
        'Week 4',
        'Week 5',
        'Week 6',
        'Week 7',
        'Week 8',
        'Week 9',
        'Week 10',
        'Week 11',
        'Week 12',
        'Week 13',
        'Week 14',
        'Week 15',
        'Week 16',
        'Week 17',
        'Week 18',
        'Week 19',
        'Week 20',
        'Week 21',
        'Week 22',
        'Week 23',
        'Week 24'
      ],
      datasets: [
        {
          label: 'Orders',
          data: this.orders.weeklyData.orders,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderRadius: 6
        },
        {
          label: 'Units',
          data: this.orders.weeklyData.orderUnits,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--primary-light-color'),
          borderRadius: 6
        }
      ]
    };

    let newBarData = { ...this.chartData };
    switch (this.selectedDate.name) {
      case 'Monthly':
        newBarData = monthlyData;
        break;
      case 'Weekly':
        newBarData = weeklyData;
        break;
      case 'Daily':
        newBarData = dailyData;
        break;
      default:
        break;
    }

    this.chartData = newBarData;
  }



}
