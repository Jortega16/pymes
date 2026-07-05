import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-analytics-tracker',
  standalone: true,
  template: '',
})
export class AnalyticsTrackerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  ngOnInit(): void {
    this.api.trackPageView(window.location.pathname + window.location.search).subscribe({ error: () => undefined });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.api.trackPageView((event as NavigationEnd).urlAfterRedirects).subscribe({ error: () => undefined });
    });
  }
}
