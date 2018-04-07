import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as echarts from 'echarts';

@Component({
  selector: 'chart-basic',
  templateUrl: './chart-basic.component.html',
  styleUrls: ['./chart-basic.component.css']
})
export class ChartBasicComponent implements OnInit {
  @ViewChild('chart', { read: ElementRef }) chartEl: ElementRef;

  private chart: echarts.ECharts;

  constructor() { }

  ngOnInit() {
    this.chart = echarts.init(this.chartEl.nativeElement, 'dark');
    console.log(this.chart);
    this.chart.setOption({
      title: {
        text: 'Example Chart'
      },
      tooltip: {},
      // legend: {
      //   data: ['Sales']
      // },
      xAxis: {
        data: ['shirt', 'cardigan', 'chiffon shirt', 'pants', 'heels', 'socks']
      },
      yAxis: {},
      series: [{
        name: 'Sales',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    });
  }

}
