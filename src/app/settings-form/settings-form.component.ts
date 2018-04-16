import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EmitterService } from '../emitter.service';
import { MatSliderChange } from '@angular/material';

import {map, sampleTime} from 'rxjs/operators';
import { PidService } from '../pid.service';

@Component({
  selector: 'settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css']
})
export class SettingsFormComponent implements OnInit {

  settingsForm: FormGroup;

  currentValue: number;

  constructor(private fb: FormBuilder, public pid: PidService) {
    this.createForm();
    this.settingsForm.valueChanges
    .pipe(map(v => ({
      target: v.target / 100.0,
      ps: v.proportional / 100.0,
      is: v.integral / 100.0,
      ds: v.derivative / 100.0
    }))).subscribe(settings => {
      // this.emitter.setTarget(settings.target);
      // this.emitter.setPid(settings);
      pid.setPidTarget({
        target: settings.target,
        kp: settings.ps,
        ki: settings.is,
        kd: settings.ds
      });
    });

    // emitter.currentPoints.pipe(
    //   map(p => p.data),
    //   map(v => Math.trunc(v * 1000)/1000)
    // ).subscribe(value => this.currentValue = value);

    pid.data$.pipe(
      map(data => Math.trunc(data.current * 1000) / 1000)
    ).subscribe(value => this.currentValue = value);
  }

  ngOnInit() {
    this.settingsForm.updateValueAndValidity();
  }

  createForm() {
    this.settingsForm = this.fb.group({
      target: [100],
      proportional: [25],
      integral: [0],
      derivative: [0]
    });
  }
}
