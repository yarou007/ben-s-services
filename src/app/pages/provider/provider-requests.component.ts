import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { JobRecord, PlatformProvider, PlatformStoreService } from '../../core/platform-store.service';
import { ProviderWorkspaceStateService } from '../../core/provider-workspace-state.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import { formatDateChip, formatTimeChip } from './provider-portal.utils';

type DateFilter = 'ALL' | 'TODAY' | 'NEXT_7' | 'NEXT_30';
type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

@Component({
  selector: 'app-provider-requests',
  standalone: true,
  imports: [NgFor, NgIf, StatusBadgeComponent, ToastMessageComponent],
  templateUrl: './provider-requests.component.html'
})
export class ProviderRequestsComponent {
  provider: PlatformProvider | null = null;
  jobs: JobRecord[] = [];

  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  dateFilter: DateFilter = 'ALL';
  serviceFilter = 'ALL';

  showToast = false;
  toastTone: 'success' | 'error' | 'info' = 'info';
  toastMessage = '';

  constructor(
    private readonly store: PlatformStoreService,
    private readonly workspace: ProviderWorkspaceStateService
  ) {
    this.initialize();
  }

  initialize(): void {
    const firstActive = this.store.listProviders().find((provider) => provider.approvalStatus === 'ACTIVE') ?? this.store.listProviders()[0];
    if (!firstActive) {
      return;
    }
    this.provider = firstActive;
    this.reload();
  }

  reload(): void {
    if (!this.provider) {
      this.jobs = [];
      return;
    }

    this.jobs = this.store.listJobsForProvider(this.provider.id);
  }

  get serviceOptions(): string[] {
    return [...new Set(this.jobs.map((job) => job.serviceType))];
  }

  get filteredJobs(): JobRecord[] {
    const text = this.searchTerm.trim().toLowerCase();
    const now = new Date();
    const next7 = new Date();
    const next30 = new Date();
    next7.setDate(now.getDate() + 7);
    next30.setDate(now.getDate() + 30);

    return this.jobs.filter((job, index) => {
      const searchMatch = !text || `${job.id} ${job.requestId} ${job.customerName} ${job.location} ${job.title}`.toLowerCase().includes(text);
      const serviceMatch = this.serviceFilter === 'ALL' || job.serviceType === this.serviceFilter;
      const statusMatch = this.statusMatches(job);

      const scheduled = this.workspace.scheduledAtFor(job, index);
      const dateMatch = this.dateFilter === 'ALL'
        || (this.dateFilter === 'TODAY' && this.sameDay(scheduled, now))
        || (this.dateFilter === 'NEXT_7' && scheduled >= now && scheduled <= next7)
        || (this.dateFilter === 'NEXT_30' && scheduled >= now && scheduled <= next30);

      return searchMatch && serviceMatch && statusMatch && dateMatch;
    });
  }

  scheduledDate(job: JobRecord): string {
    const index = this.jobs.findIndex((entry) => entry.requestId === job.requestId);
    const scheduled = this.workspace.scheduledAtFor(job, Math.max(index, 0));
    return `${formatDateChip(scheduled)} ${formatTimeChip(scheduled)}`;
  }

  accept(job: JobRecord): void {
    if (!this.provider) {
      return;
    }

    const accepted = this.store.acceptJob(this.provider.id, job.requestId);
    if (!accepted) {
      this.notify('Unable to accept this request.', 'error');
      return;
    }

    this.reload();
    this.notify(`${job.id} accepted.`, 'success');
  }

  decline(job: JobRecord): void {
    if (!this.provider) {
      return;
    }

    const declined = this.store.declineJob(this.provider.id, job.requestId);
    if (!declined) {
      this.notify('Unable to decline this request.', 'error');
      return;
    }

    this.reload();
    this.notify(`${job.id} declined.`, 'info');
  }

  start(job: JobRecord): void {
    const nextStatus = job.status === 'ASSIGNED' || job.status === 'ACCEPTED_BY_PROVIDER'
      ? 'ON_THE_WAY'
      : 'IN_PROGRESS';

    const updated = this.store.updateRequestStatus(job.requestId, nextStatus);
    if (!updated) {
      this.notify('Unable to start this request.', 'error');
      return;
    }

    this.reload();
    this.notify(`${job.id} moved to ${nextStatus.replace(/_/g, ' ')}.`, 'success');
  }

  complete(job: JobRecord): void {
    const updated = this.store.updateRequestStatus(job.requestId, 'COMPLETED');
    if (!updated) {
      this.notify('Unable to complete this request.', 'error');
      return;
    }

    this.reload();
    this.notify(`${job.id} marked completed.`, 'success');
  }

  canAccept(job: JobRecord): boolean {
    return !job.assignedProviderId && ['PENDING', 'MATCHING', 'ASSIGNED'].includes(job.status);
  }

  canDecline(job: JobRecord): boolean {
    return !!this.provider && job.assignedProviderId === this.provider.id;
  }

  canStart(job: JobRecord): boolean {
    return ['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY'].includes(job.status);
  }

  canComplete(job: JobRecord): boolean {
    return ['IN_PROGRESS', 'ON_THE_WAY', 'ACCEPTED_BY_PROVIDER'].includes(job.status);
  }

  dismissToast(): void {
    this.showToast = false;
  }

  private statusMatches(job: JobRecord): boolean {
    if (this.statusFilter === 'ALL') {
      return true;
    }
    if (this.statusFilter === 'PENDING') {
      return ['PENDING', 'MATCHING', 'ASSIGNED'].includes(job.status);
    }
    if (this.statusFilter === 'ACTIVE') {
      return ['ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS'].includes(job.status);
    }
    if (this.statusFilter === 'COMPLETED') {
      return job.status === 'COMPLETED';
    }
    return ['CANCELLED', 'REJECTED'].includes(job.status);
  }

  private sameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
