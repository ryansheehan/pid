import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import { Observer } from 'rxjs/Observer';
import { DataPoint } from './models/data-point';
import { PIDEnv } from './models/pid-env';

import 'rxjs/add/observable/of';
import {
  mapTo,
  map,
  publishBehavior,
  switchMap
} from 'rxjs/operators';

const dt = 1 / 60;
const maxProcessingTime = 180.0;
const tolerance = 0.01;

@Injectable()
export class PidService {

  dataPoints$: Observable<DataPoint[]>;
  private _env$ = new Subject<PIDEnv>();

  processEnv(env: PIDEnv): void {
    this._env$.next(env);
  }

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

  constructor() {
    this.dataPoints$ = this._env$.pipe(
      map(v => Observable.of(v).pipe(
        map(env => {
          let processTime = 0;
          let totalError = 0;
          let error = env.target - env.start;
          let value = env.start;
          const {target, proportional, integral, derivative} = env;
          const points: DataPoint[] = [{time: 0, value}];
          while (processTime < maxProcessingTime && error > tolerance) {
            const c = this.calculate(value, target, proportional, integral, derivative, error, totalError, dt);
            value = c.value;
            error = c.error;
            totalError = c.totalError;
            processTime += dt;
            points.push({time: processTime, value});
          }
          return points;
        }),
      )),
      switchMap(v => v),
      publishBehavior([])
    );
  }

}
