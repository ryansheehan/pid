import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TimeSeries, SmoothieChart } from 'smoothie';
import { EmitterService } from '../emitter.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'pid-chart',
  templateUrl: './pid-chart.component.html',
  styleUrls: ['./pid-chart.component.css']
})
export class PidChartComponent implements OnInit, OnDestroy {
  @ViewChild('pidChart') pidChartRef: ElementRef;

  private _targetLine = new TimeSeries();
  private _currentLine = new TimeSeries();

  private _subscriptions: Subscription[] = [];

  private _smoothie = new SmoothieChart({
    minValue: -1.5,
    maxValue: 1.5,
    minValueScale: 1.1,
    maxValueScale: 1.1,
    responsive: true,
    // maxDataSetLength: 180,
    // millisPerPixel: 60
    nonRealtimeData: true
  });

  constructor(private emitter: EmitterService) {
  }

  ngOnInit() {
    this._smoothie.streamTo(this.pidChartRef.nativeElement);
    this._smoothie.addTimeSeries(this._targetLine);
    this._smoothie.addTimeSeries(this._currentLine);
    this.emitter.targetPoints.subscribe(data => this._targetLine.append(data.time, data.data));
    this.emitter.currentPoints.subscribe(data => this._currentLine.append(data.time, data.data));
    // setInterval(() => {
    //   this._targetLine.append(Date.now(), Math.random());
    //   this._currentLine.append(Date.now(), Math.random());
    // }, 1000);
  }

  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];
  }

}
