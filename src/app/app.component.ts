import { Component } from '@angular/core';
import { EmitterService } from './emitter.service';

import {
  take
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PID';

  constructor() {
  }
}
