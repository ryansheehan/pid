import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import {
  scan,
  combineLatest,
  timeInterval,
  merge,
  map,
  tap,
  take,
  skip,
  publishBehavior,
  publish,
  sample,
  sampleTime,
  repeatWhen,
  first,
  filter,
  mergeMap,
  zip,
  startWith,
  bufferCount,
  expand
} from 'rxjs/operators';

export interface IPidTarget {
  target: number;
  kp: number;
  ki: number;
  kd: number;
}

export type TransformFn = (output: number, input: number, time: number) => number;

const defaultTransformFn: TransformFn = (function() {
  const throttle_max = 100;
  let lastTime = Date.now();
  let throttle = 0;

  return (output: number, input: number, time: number) => {
    const dt = (time - lastTime) / 1000 ;

    lastTime = time;
    return output + input;
  };
})();

@Injectable()
export class PidService {

  pause = false;
  transformFn: TransformFn = defaultTransformFn;

  data$ = new BehaviorSubject({current: 0, target: 0, time: Date.now()});

  private lastTime = 0;
  private errSum = 0;
  private lastError = 0;
  private output = new BehaviorSubject(0);
  private input = 0;

  private _intervalHandle: any | null;
  private _interval = 16;
  get interval(): number { return this._interval; }
  set interval(value: number) {
    if (this._intervalHandle) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = null;
    }
    this._interval = value;

    this._intervalHandle = setInterval(() => this.updatePid(), this._interval);
  }

  currentPidTarget: IPidTarget = {
    target: 0,
    kp: 0,
    ki: 0,
    kd: 0
  };

  private pendingPidTarget: IPidTarget | null = null;

  constructor() {
    const o$ = this.output.pipe(
      map(o => this.transformFn(this.input, o, this.lastTime))
    );

    o$.subscribe(v => this.input = v);
  }

  start(reset = false, interval = 16) {
    if (reset) {
      this.reset();
    }
    this.interval = interval;
  }

  updatePid() {
    if (this.pendingPidTarget) {
      this.currentPidTarget = {...this.pendingPidTarget};
      this.pendingPidTarget = null;
    }

    const now = Date.now();
    const dt = (now - this.lastTime) / 1000.0;

    const {target, kp, ki, kd} = this.currentPidTarget;
    const error = target - this.input;
    this.errSum += (error * dt);
    const deltaError = (error - this.lastError) / dt;

    const output = kp * error + ki * this.errSum + kd * deltaError;

    this.lastError = error;
    this.lastTime = now;

    this.output.next(output);
    this.data$.next({current: this.input, target, time: now});
  }

  setPidTarget(values: IPidTarget) {
    this.pendingPidTarget = {...values};
  }

  reset() {
    this.lastTime = Date.now();
    this.errSum = 0;
    this.lastError = 0;
    this.output.next(0);
    this.data$.next({current: 0, target: 0, time: Date.now()});
  }
}
