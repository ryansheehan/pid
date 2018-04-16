import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatIconModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatInputModule,
  MatFormFieldModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { EmitterService } from './emitter.service';
import { PidChartComponent } from './pid-chart/pid-chart.component';
import { PidService } from './pid.service';


@NgModule({
  declarations: [
    AppComponent,
    SettingsFormComponent,
    PidChartComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatInputModule,
    MatFormFieldModule
  ],
  providers: [EmitterService, PidService],
  bootstrap: [AppComponent]
})
export class AppModule { }
