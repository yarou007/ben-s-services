import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
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
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';

interface DashboardCard {
  label: string;
  value: string;
  note: string;
  trend: 'up' | 'down' | 'steady';
  path: string;
  queryStatus?: RequestStatus | 'ALL';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    DashboardStatsCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DetailsModalComponent,
    ToastMessageComponent
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

  constructor(private readonly store: PlatformStoreService) {
    this.load();
  }

  load(): void {
    this.requests = this.store.listRequests();
  }

  get cards(): DashboardCard[] {
    const total = this.requests.length;
    const pending = this.countStatuses(['PENDING', 'MATCHING']);
    const assigned = this.countStatuses(['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS']);
    const completed = this.countStatuses(['COMPLETED']);
    const cancelled = this.countStatuses(['CANCELLED', 'REJECTED']);
    const providers = this.store.listProviders().filter((provider) => provider.approvalStatus === 'ACTIVE').length;
    const customers = new Set(this.requests.map((request) => request.customerName)).size;

    return [
      { label: 'Total requests', value: String(total), note: 'All service records', trend: 'steady', path: '/admin/requests' },
      { label: 'Pending requests', value: String(pending), note: 'Needs dispatch action', trend: 'up', path: '/admin/requests', queryStatus: 'PENDING' },
      { label: 'Assigned requests', value: String(assigned), note: 'In active workflow', trend: 'steady', path: '/admin/requests', queryStatus: 'ASSIGNED' },
      { label: 'Completed requests', value: String(completed), note: 'Successfully closed', trend: 'up', path: '/admin/requests', queryStatus: 'COMPLETED' },
      { label: 'Cancelled requests', value: String(cancelled), note: 'Cancelled or rejected', trend: 'down', path: '/admin/requests', queryStatus: 'CANCELLED' },
      { label: 'Active providers', value: String(providers), note: 'Approved and available', trend: 'steady', path: '/admin/providers' },
      { label: 'Customers', value: String(customers), note: 'Unique request owners', trend: 'up', path: '/admin/crm' }
    ];
  }

  get latestRequests(): PlatformRequest[] {
    return [...this.requests].slice(0, 6);
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

  private countStatuses(statuses: RequestStatus[]): number {
    return this.requests.filter((request) => statuses.includes(request.status)).length;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
