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

@Injectable()
export class PidService {

  private lastTime = 0;
  private errSum = 0;
  private lastError = 0;

  pause = false;

  interval = 16;

  kp = 0;
  ki = 0;
  kd = 0;

  target = 0;

  constructor() {

  }

}
