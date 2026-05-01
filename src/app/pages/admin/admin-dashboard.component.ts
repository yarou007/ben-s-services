import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import {
  adminHighlights,
  adminRequests,
  adminStats,
  regionStats,
  reportTemplates,
  serviceCatalog
} from '../../core/mock-data';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  stats = adminStats;
  requests = adminRequests;
  highlights = adminHighlights;
  regions = regionStats;
  services = serviceCatalog;
  reports = reportTemplates;

  trendClass(trend: string): string {
    if (trend === 'up') {
      return 'text-emerald-600';
    }
    if (trend === 'down') {
      return 'text-rose-600';
    }
    return 'text-slate-500';
  }
}
