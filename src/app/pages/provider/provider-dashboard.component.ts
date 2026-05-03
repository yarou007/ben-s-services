import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  JobRecord,
  PlatformProvider,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { DashboardStatsCardComponent } from '../../shared/components/dashboard-stats-card/dashboard-stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface ProviderCard {
  key: 'ALL' | 'NEW' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  label: string;
  value: number;
  note: string;
  trend: 'up' | 'down' | 'steady';
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    DashboardStatsCardComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    PaginationControlsComponent,
    ToastMessageComponent,
    DetailsModalComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './provider-dashboard.component.html'
})
export class ProviderDashboardComponent {
  provider: PlatformProvider | null = null;
  jobs: JobRecord[] = [];

  searchTerm = '';
  statusFilter: 'ALL' | 'NEW' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  serviceFilter = 'ALL';
  urgencyFilter = 'ALL';

  page = 1;
  pageSize = 5;

  selectedJob: JobRecord | null = null;
  showDetailsModal = false;

  showConfirmDialog = false;
  confirmLabel = 'Confirm';
  confirmTitle = 'Confirm Action';
  confirmMessage = '';
  pendingAction: (() => void) | null = null;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(private readonly store: PlatformStoreService) {
    this.initialize();
  }

  initialize(): void {
    const firstActive = this.store.listProviders().find((provider) => provider.approvalStatus === 'ACTIVE') ?? this.store.listProviders()[0];

    if (!firstActive) {
      return;
    }

    this.provider = firstActive;
    this.loadJobs();
  }

  loadJobs(): void {
    if (!this.provider) {
      this.jobs = [];
      return;
    }
    this.jobs = this.store.listJobsForProvider(this.provider.id);
  }

  get cards(): ProviderCard[] {
    return [
      { key: 'ALL', label: 'All jobs', value: this.jobs.length, note: 'Available + assigned', trend: 'steady' },
      { key: 'NEW', label: 'New jobs', value: this.countByFilter('NEW'), note: 'Not assigned yet', trend: 'up' },
      { key: 'ACCEPTED', label: 'Accepted', value: this.countByFilter('ACCEPTED'), note: 'Accepted by you', trend: 'steady' },
      { key: 'ACTIVE', label: 'In progress', value: this.countByFilter('ACTIVE'), note: 'On the way / working', trend: 'up' },
      { key: 'COMPLETED', label: 'Completed', value: this.countByFilter('COMPLETED'), note: 'Closed jobs', trend: 'up' },
      { key: 'CANCELLED', label: 'Cancelled', value: this.countByFilter('CANCELLED'), note: 'Rejected or cancelled', trend: 'down' }
    ];
  }

  get filteredJobs(): JobRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.jobs.filter((job) => {
      const matchesCard = this.matchesStatusFilter(job);
      const matchesService = this.serviceFilter === 'ALL' || job.serviceType === this.serviceFilter;
      const matchesUrgency = this.urgencyFilter === 'ALL' || job.urgency === this.urgencyFilter;

      const source = `${job.id} ${job.requestId} ${job.title} ${job.customerName} ${job.location}`.toLowerCase();
      const matchesSearch = !search || source.includes(search);

      return matchesCard && matchesService && matchesUrgency && matchesSearch;
    });
  }

  get pagedJobs(): JobRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get serviceOptions(): string[] {
    return [...new Set(this.jobs.map((job) => job.serviceType))];
  }

  get urgencyOptions(): string[] {
    return [...new Set(this.jobs.map((job) => job.urgency))];
  }

  get detailsFields(): DetailField[] {
    if (!this.selectedJob) {
      return [];
    }

    return [
      { label: 'Job ID', value: this.selectedJob.id },
      { label: 'Request ID', value: this.selectedJob.requestId },
      { label: 'Service Type', value: this.selectedJob.serviceType },
      { label: 'Status', value: this.selectedJob.status.replace('_', ' ') },
      { label: 'Urgency', value: this.selectedJob.urgency },
      { label: 'Customer', value: this.selectedJob.customerName },
      { label: 'Location', value: this.selectedJob.location },
      { label: 'Created', value: this.selectedJob.createdAt }
    ];
  }

  setCardFilter(filter: ProviderCard['key']): void {
    this.statusFilter = filter;
    this.page = 1;
  }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.searchTerm = '';
    this.serviceFilter = 'ALL';
    this.urgencyFilter = 'ALL';
    this.page = 1;
  }

  openDetails(job: JobRecord): void {
    this.selectedJob = job;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedJob = null;
  }

  acceptJob(job: JobRecord): void {
    if (!this.provider) {
      return;
    }

    const accepted = this.store.acceptJob(this.provider.id, job.requestId);
    if (!accepted) {
      this.notify('Unable to accept this job.', 'error');
      return;
    }

    this.loadJobs();
    this.notify(`${job.id} accepted.`, 'success');
  }

  declineJob(job: JobRecord): void {
    if (!this.provider) {
      return;
    }

    const declined = this.store.declineJob(this.provider.id, job.requestId);
    if (!declined) {
      this.notify('Unable to decline this job.', 'error');
      return;
    }

    this.loadJobs();
    this.notify(`${job.id} returned to dispatch queue.`, 'info');
  }

  confirmStatusUpdate(job: JobRecord, status: RequestStatus, label: string): void {
    this.confirmTitle = `${label} ${job.id}`;
    this.confirmMessage = `This updates ${job.id} to ${this.formatStatus(status)}.`;
    this.confirmLabel = label;
    this.pendingAction = () => {
      const updated = this.store.updateRequestStatus(job.requestId, status);
      if (!updated) {
        this.notify('Status update failed.', 'error');
        return;
      }
      this.loadJobs();
      this.notify(`${job.id} updated to ${this.formatStatus(status)}.`, 'success');
    };
    this.showConfirmDialog = true;
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.pendingAction = null;
  }

  runConfirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.closeConfirmDialog();
  }

  exportJobs(): void {
    if (!this.filteredJobs.length) {
      this.notify('No jobs available to export.', 'info');
      return;
    }

    downloadCsv({
      filename: `jobs-export-${todayForFileName()}.csv`,
      rows: this.filteredJobs.map((job) => ({
        'Job ID': job.id,
        'Request ID': job.requestId,
        Service: job.serviceType,
        Customer: job.customerName,
        Location: job.location,
        Urgency: job.urgency,
        Status: job.status,
        Created: job.createdAt
      }))
    });

    this.notify('Jobs export completed.', 'success');
  }

  refreshJobs(): void {
    this.loadJobs();
    this.notify('Jobs refreshed.', 'info');
  }

  pageChange(next: number): void {
    this.page = next;
  }

  pageSizeChange(next: number): void {
    this.pageSize = next;
    this.page = 1;
  }

  canAccept(job: JobRecord): boolean {
    const isUnassigned = !job.assignedProviderId;
    return isUnassigned && ['PENDING', 'MATCHING', 'ASSIGNED'].includes(job.status);
  }

  canDecline(job: JobRecord): boolean {
    if (!this.provider) {
      return false;
    }

    return job.assignedProviderId === this.provider.id;
  }

  canMoveToOnTheWay(job: JobRecord): boolean {
    return job.status === 'ACCEPTED_BY_PROVIDER' || job.status === 'ASSIGNED';
  }

  canMoveToInProgress(job: JobRecord): boolean {
    return job.status === 'ON_THE_WAY';
  }

  canMoveToCompleted(job: JobRecord): boolean {
    return job.status === 'IN_PROGRESS' || job.status === 'ON_THE_WAY';
  }

  dismissToast(): void {
    this.showToast = false;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private matchesStatusFilter(job: JobRecord): boolean {
    return this.matchesStatusFilterFor(job, this.statusFilter);
  }

  private countByFilter(filter: ProviderCard['key']): number {
    return this.jobs.filter((job) => this.matchesStatusFilterFor(job, filter)).length;
  }

  private matchesStatusFilterFor(
    job: JobRecord,
    filter: 'ALL' | 'NEW' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  ): boolean {
    if (filter === 'ALL') {
      return true;
    }

    if (filter === 'NEW') {
      return ['PENDING', 'MATCHING'].includes(job.status) && !job.assignedProviderId;
    }

    if (filter === 'ACCEPTED') {
      return job.status === 'ACCEPTED_BY_PROVIDER';
    }

    if (filter === 'ACTIVE') {
      return ['ON_THE_WAY', 'IN_PROGRESS'].includes(job.status);
    }

    if (filter === 'COMPLETED') {
      return job.status === 'COMPLETED';
    }

    return ['CANCELLED', 'REJECTED'].includes(job.status);
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
