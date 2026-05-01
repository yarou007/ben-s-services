import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { providerHistory, providerJobs, providerNotifications, providerStats } from '../../core/mock-data';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [NgFor, NgClass, RouterLink],
  templateUrl: './provider-dashboard.component.html'
})
export class ProviderDashboardComponent {
  stats = providerStats;
  jobs = providerJobs;
  notifications = providerNotifications;
  history = providerHistory;

  statusPill(status: string): string {
    if (status === 'Pending') {
      return 'pill pill-orange';
    }
    if (status === 'Accepted') {
      return 'pill pill-blue';
    }
    return 'pill pill-ink';
  }
}
