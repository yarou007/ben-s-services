import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ProviderHistory,
  ProviderJob,
  ProviderNotification,
  ProviderStat,
  providerHistory,
  providerJobs,
  providerNotifications,
  providerStats
} from '../../core/mock-data';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, RouterLink],
  templateUrl: './provider-dashboard.component.html'
})
export class ProviderDashboardComponent {
  stats: ProviderStat[] = [...providerStats];
  jobs: ProviderJob[] = [...providerJobs];
  notifications: ProviderNotification[] = [...providerNotifications];
  history: ProviderHistory[] = [...providerHistory];
  feedback = '';
  pendingOnly = false;
  selectedJobId = '';

  get visibleJobs(): ProviderJob[] {
    if (!this.pendingOnly) {
      return this.jobs;
    }
    return this.jobs.filter((job) => job.status === 'Pending');
  }

  statusPill(status: string): string {
    if (status === 'Pending') {
      return 'pill pill-orange';
    }
    if (status === 'Accepted') {
      return 'pill pill-blue';
    }
    return 'pill pill-ink';
  }

  togglePendingFilter(): void {
    this.pendingOnly = !this.pendingOnly;
    this.feedback = this.pendingOnly
      ? 'Showing only pending jobs.'
      : 'Showing all jobs.';
  }

  acceptJob(job: ProviderJob): void {
    job.status = 'Accepted';
    this.selectedJobId = job.id;
    this.feedback = `${job.id} accepted successfully.`;
    this.notifications = [
      {
        time: 'Now',
        message: `You accepted ${job.id} and ETA was shared with customer.`
      },
      ...this.notifications
    ].slice(0, 5);
  }

  rejectJob(job: ProviderJob): void {
    job.status = 'Pending';
    this.selectedJobId = job.id;
    this.feedback = `${job.id} rejected and returned to dispatch queue.`;
    this.notifications = [
      {
        time: 'Now',
        message: `Dispatch was notified that ${job.id} needs reassignment.`
      },
      ...this.notifications
    ].slice(0, 5);
  }

  viewJobDetails(job: ProviderJob): void {
    this.selectedJobId = job.id;
    this.feedback = `Previewing ${job.id}: ${job.title}.`;
  }

  downloadHistoryReport(): void {
    this.feedback = 'Service history report download started (demo mode).';
  }
}
