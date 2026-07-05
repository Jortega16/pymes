import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsTrackerComponent } from './analytics-tracker.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnalyticsTrackerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
