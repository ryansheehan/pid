import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import { PidService } from './pid.service';

import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/zip';
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
  sample,
  repeatWhen,
  first,
  mergeMap,
  zip,
  startWith,
  bufferCount,
  expand
} from 'rxjs/operators';
import { buffer } from 'd3';

export interface IPid {
  ps: number;
  is: number;
  ds: number;
}

export interface Point {
  time: number;
  value: number;
}

@Injectable()
export class EmitterService {

  private _pause = new BehaviorSubject(false);

  private _animFrame = Observable.interval(0, animationFrame).pipe(
    timeInterval(),
    skip(1),
    map(v => v.interval)
  );

  private _time_total_ms = this._animFrame.pipe(
    scan((acc: number, value: number) => acc + value, 0),
    // publishBehavior(0)
  );

  private _deltaTime = this._animFrame.pipe(
    map(ms => ms / 1000.0)
  );

  private _pidInput = new BehaviorSubject<IPid>({ps: 0, is: 0, ds: 0});
  private _targetInput = new BehaviorSubject(0);
  private _currentInput = new BehaviorSubject(0);
  private _inputs = this._deltaTime.pipe(
    mergeMap(v => Observable.zip(
      Observable.of(v),
      this._pidInput.pipe(first()),
      this._targetInput.pipe(first()),
      this._currentInput.pipe(first()),
      (dt, pid, target, current) => ({dt, pid, target, current})
    ))
  );
  private _error_dt = this._inputs.pipe(
    map(inputs => ({dt: inputs.dt, error: inputs.target - inputs.current}))
  );

  private _error = this._error_dt.pipe(map(error_dt => error_dt.error));

  private _acc = this._error_dt.pipe(
    scan((acc: number, value: {dt: number, error: number}) => acc + (value.error * value.dt), 0),
    startWith(0)
  );
  private _delta = this._error_dt.pipe(
    startWith({error: 0, dt: 0}),
    bufferCount(2, 1),
    map(b => (b[1].error - b[0].error) / b[1].dt)
  );
  private _errors = Observable.zip(
    this._error,
    this._acc,
    this._delta,
    (error, acc, delta) => ({error, acc, delta})
  );
  private _calculate = Observable.zip(
    this._inputs,
    this._errors,

    (inputs, errors) => {
      const {ps, is, ds} = inputs.pid;
      const {error, acc, delta} = errors;

      return ps * error + is * acc + ds * delta;
    }
  ).subscribe(result => this._currentInput.next(result));

  targetPoints = this._time_total_ms.pipe(
    zip(this._inputs.pipe(map(v => v.target)), (time, data) => ({ time, data })),
  );

  currentPoints = this._time_total_ms.pipe(
    zip(this._inputs.pipe(map(v => v.current)), (time, data) => ({ time, data })),
  );

  constructor(private pid: PidService) {

  }

  public setPid(pid: IPid) {
    this._pidInput.next(pid);
  }

  public setTarget(value: number) {
    this._targetInput.next(value);
  }
}
