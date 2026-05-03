import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { DashboardStatsCardComponent } from '../../shared/components/dashboard-stats-card/dashboard-stats-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import {
  PaginationControlsComponent
} from '../../shared/components/pagination-controls/pagination-controls.component';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';

interface DashboardKpi {
  label: string;
  value: string;
  note: string;
  comparison: string;
  trend: 'up' | 'down' | 'steady';
  path: string;
  queryStatus?: RequestStatus | 'ALL';
}

interface TrendPoint {
  label: string;
  opened: number;
  closed: number;
}

interface ComparisonBar {
  label: string;
  value: number;
  tone: 'blue' | 'green' | 'orange' | 'red';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    RouterLink,
    DashboardStatsCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DetailsModalComponent,
    ToastMessageComponent,
    PaginationControlsComponent
  ],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  requests: PlatformRequest[] = [];

  selectedRequest: PlatformRequest | null = null;
  showDetailsModal = false;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  tablePage = 1;
  tablePageSize = 4;

  constructor(private readonly store: PlatformStoreService) {
    this.load();
  }

  load(): void {
    this.requests = this.store.listRequests();
  }

  get topKpis(): DashboardKpi[] {
    const total = this.requests.length;
    const pending = this.countStatuses(['PENDING', 'MATCHING']);
    const inProgress = this.countStatuses(['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS']);
    const completed = this.countStatuses(['COMPLETED']);
    const cancelled = this.countStatuses(['CANCELLED', 'REJECTED']);
    const activeProviders = this.store.listProviders().filter((provider) => provider.approvalStatus === 'ACTIVE').length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;

    return [
      {
        label: 'Total Requests',
        value: String(total),
        note: `${pending} pending triage`,
        comparison: 'Compared with current seeded volume',
        trend: 'steady',
        path: '/admin/requests'
      },
      {
        label: 'Pending Queue',
        value: String(pending),
        note: `${Math.max(0, pending - inProgress)} waiting for assignment`,
        comparison: 'Target: keep below 30% of total',
        trend: pending > 0 ? 'up' : 'steady',
        path: '/admin/requests',
        queryStatus: 'PENDING'
      },
      {
        label: 'Active Jobs',
        value: String(inProgress),
        note: `${activeProviders} active providers online`,
        comparison: 'Dispatch + travel + in-progress phases',
        trend: 'steady',
        path: '/admin/requests',
        queryStatus: 'ASSIGNED'
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        note: `${completed} requests completed`,
        comparison: cancellationRate > 0 ? `Cancellation rate ${cancellationRate}%` : 'No cancellations in current slice',
        trend: completionRate >= 50 ? 'up' : 'steady',
        path: '/admin/requests',
        queryStatus: 'COMPLETED'
      },
      {
        label: 'Active Providers',
        value: String(activeProviders),
        note: 'Approved and available',
        comparison: 'Coverage supports current demand',
        trend: activeProviders >= 2 ? 'up' : 'steady',
        path: '/admin/providers'
      }
    ];
  }

  get weeklyTrend(): TrendPoint[] {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const total = Math.max(1, this.requests.length);
    const completed = this.countStatuses(['COMPLETED']);

    return labels.map((label, index) => {
      const opened = Math.max(2, Math.round(total * 0.45) + ((index * 3 + total) % 5));
      const closed = Math.max(1, Math.round(completed * 0.42) + ((index * 2 + completed) % 4));
      return { label, opened, closed };
    });
  }

  get serviceMix(): ComparisonBar[] {
    const grouped = new Map<string, number>();

    this.requests.forEach((request) => {
      grouped.set(request.serviceType, (grouped.get(request.serviceType) ?? 0) + 1);
    });

    const tones: ComparisonBar['tone'][] = ['blue', 'green', 'orange', 'red'];

    return [...grouped.entries()]
      .map(([label, value], index) => ({
        label,
        value,
        tone: tones[index % tones.length]
      }))
      .sort((left, right) => right.value - left.value);
  }

  get statusMix(): ComparisonBar[] {
    const statuses: RequestStatus[] = [
      'PENDING',
      'MATCHING',
      'ASSIGNED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ];

    return statuses
      .map((status) => {
        const tone: ComparisonBar['tone'] = status === 'COMPLETED'
          ? 'green'
          : status === 'CANCELLED'
            ? 'red'
            : status === 'IN_PROGRESS'
              ? 'orange'
              : 'blue';

        return {
          label: this.formatStatus(status),
          value: this.countStatuses([status]),
          tone
        };
      })
      .filter((item) => item.value > 0)
      .sort((left, right) => right.value - left.value);
  }

  get maxComparisonValue(): number {
    return Math.max(
      1,
      ...this.serviceMix.map((item) => item.value),
      ...this.statusMix.map((item) => item.value)
    );
  }

  get latestRequests(): PlatformRequest[] {
    return [...this.requests].slice(0, 8);
  }

  get pagedLatestRequests(): PlatformRequest[] {
    const start = (this.tablePage - 1) * this.tablePageSize;
    return this.latestRequests.slice(start, start + this.tablePageSize);
  }

  get detailsFields(): DetailField[] {
    if (!this.selectedRequest) {
      return [];
    }

    return [
      { label: 'Request ID', value: this.selectedRequest.id },
      { label: 'Service Type', value: this.selectedRequest.serviceType },
      { label: 'Status', value: this.formatStatus(this.selectedRequest.status) },
      { label: 'Urgency', value: this.selectedRequest.urgency },
      { label: 'Customer', value: this.selectedRequest.customerName },
      { label: 'Location', value: this.selectedRequest.location },
      { label: 'Created', value: this.selectedRequest.createdAt },
      { label: 'Updated', value: this.selectedRequest.updatedAt }
    ];
  }

  openedTrendPoints(width = 540, height = 160): string {
    return this.buildLinePoints(this.weeklyTrend.map((point) => point.opened), width, height);
  }

  closedTrendPoints(width = 540, height = 160): string {
    return this.buildLinePoints(this.weeklyTrend.map((point) => point.closed), width, height);
  }

  barWidth(value: number): string {
    const ratio = (value / this.maxComparisonValue) * 100;
    return `${Math.max(8, ratio)}%`;
  }

  barToneClass(tone: ComparisonBar['tone']): string {
    if (tone === 'green') {
      return 'bg-emerald-500';
    }
    if (tone === 'orange') {
      return 'bg-orange-500';
    }
    if (tone === 'red') {
      return 'bg-rose-500';
    }
    return 'bg-brand-500';
  }

  tablePageChange(nextPage: number): void {
    this.tablePage = nextPage;
  }

  tablePageSizeChange(nextSize: number): void {
    this.tablePageSize = nextSize;
    this.tablePage = 1;
  }

  openDetails(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  quickComplete(request: PlatformRequest): void {
    const updated = this.store.updateRequestStatus(request.id, 'COMPLETED');
    if (!updated) {
      this.notify('Unable to update request.', 'error');
      return;
    }

    this.load();
    this.notify(`${request.id} marked as completed.`, 'success');
  }

  exportSnapshot(): void {
    if (!this.requests.length) {
      this.notify('No requests available for export.', 'info');
      return;
    }

    downloadCsv({
      filename: `requests-export-${todayForFileName()}.csv`,
      rows: this.requests.map((request) => ({
        'Request ID': request.id,
        Service: request.serviceType,
        Customer: request.customerName,
        City: request.city,
        Urgency: request.urgency,
        Status: request.status,
        Created: request.createdAt
      }))
    });

    this.notify('Dashboard request snapshot exported.', 'success');
  }

  dismissToast(): void {
    this.showToast = false;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private buildLinePoints(values: number[], width: number, height: number): string {
    const max = Math.max(1, ...values);
    const min = Math.min(...values);
    const xStep = width / Math.max(1, values.length - 1);

    return values
      .map((value, index) => {
        const x = index * xStep;
        const normalized = max === min ? 0.5 : (value - min) / (max - min);
        const y = height - normalized * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  private countStatuses(statuses: RequestStatus[]): number {
    return this.requests.filter((request) => statuses.includes(request.status)).length;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
