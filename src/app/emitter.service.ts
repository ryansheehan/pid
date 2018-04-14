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

  private _time_now = this._animFrame.pipe(
    map(v => Date.now())
    // scan((acc: number, value: number) => acc + value, 0),
    // publishBehavior(0)
  );

  private _deltaTime = this._animFrame.pipe(
    map(ms => ms / 1000.0)
  );

  private _pidInput = new BehaviorSubject<IPid>({ps: 0, is: 0, ds: 0});
  targetInput = new BehaviorSubject(0);
  private _currentInput = new BehaviorSubject(0);
  private _inputs = this._deltaTime.pipe(
    filter(v => v > 0.001),
    mergeMap(v => Observable.zip(
      Observable.of(v),
      this._pidInput.pipe(first()),
      this.targetInput.pipe(first()),
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
  );

  targetPoints = this._time_now.pipe(
    zip(this._inputs.pipe(map(v => v.target)), (time, data) => ({ time, data })),
  );

  currentPoints = this._time_now.pipe(
    zip(this._calculate, (time, data) => ({ time, data })),
  );

  test = this._deltaTime.pipe(
    filter(v => v > 0.001),
    mergeMap(v => this._currentInput.pipe(first()))
  );

  constructor() {
    this._inputs.pipe(
      take(10)
    ).subscribe(value => console.log(value));

    this._calculate.subscribe(result => this._currentInput.next(result));
  }

  public setPid(pid: IPid) {
    this._pidInput.next(pid);
  }

  public setTarget(value: number) {
    this.targetInput.next(value);
  }
}

/*
calculate(start: number,
            target: number,
            proportionalsScalar: number,
            integralScalar: number,
            derivativeScalar: number,
            lastError: number,
            totalError: number,
            deltaTime: number): {value: number, error: number, totalError: number} {

  const error = target - start;
  totalError += error * deltaTime;
  const deltaError = (error - lastError) / deltaTime;
  const p = proportionalsScalar * error;
  const i = integralScalar * totalError;
  const d = derivativeScalar * deltaError;
  const value = p + i + d;

  return { value, error, totalError};
}
*/
