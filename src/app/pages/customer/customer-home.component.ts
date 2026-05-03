import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DashboardStatsCardComponent } from '../../shared/components/dashboard-stats-card/dashboard-stats-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { RouterLink } from '@angular/router';

interface CustomerCard {
  key: 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  label: string;
  value: number;
  note: string;
  trend: 'up' | 'down' | 'steady';
}

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    DashboardStatsCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    PaginationControlsComponent,
    ToastMessageComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './customer-home.component.html'
})
export class CustomerHomeComponent {
  requests: PlatformRequest[] = [];
  searchTerm = '';
  cardFilter: CustomerCard['key'] = 'ALL';
  serviceFilter = 'ALL';

  page = 1;
  pageSize = 5;

  selectedRequest: PlatformRequest | null = null;
  showDetailsModal = false;

  editRequest: PlatformRequest | null = null;
  showEditModal = false;
  editTitle = '';
  editLocation = '';
  editCity = '';
  editZip = '';
  editNotes = '';

  requestToCancel: PlatformRequest | null = null;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  customer = {
    name: '',
    email: '',
    phone: ''
  };

  readonly timelineFlow: RequestStatus[] = [
    'PENDING',
    'MATCHING',
    'ASSIGNED',
    'ACCEPTED_BY_PROVIDER',
    'ON_THE_WAY',
    'IN_PROGRESS',
    'COMPLETED'
  ];

  constructor(private readonly store: PlatformStoreService) {
    this.customer = this.store.getCustomerContext();
    this.load();
  }

  load(): void {
    this.requests = this.store.listCustomerRequests(this.customer.name);
  }

  get cards(): CustomerCard[] {
    return [
      { key: 'ALL', label: 'Total Requests', value: this.requests.length, note: 'All your requests', trend: 'steady' },
      { key: 'PENDING', label: 'Pending Requests', value: this.countByFilter('PENDING'), note: 'Waiting for provider assignment', trend: 'up' },
      { key: 'ACTIVE', label: 'Active Requests', value: this.countByFilter('ACTIVE'), note: 'Currently in progress', trend: 'steady' },
      { key: 'COMPLETED', label: 'Completed', value: this.countByFilter('COMPLETED'), note: 'Service finished', trend: 'up' },
      { key: 'CANCELLED', label: 'Cancelled', value: this.countByFilter('CANCELLED'), note: 'Cancelled or rejected', trend: 'down' }
    ];
  }

  get serviceOptions(): string[] {
    return [...new Set(this.requests.map((request) => request.serviceType))];
  }

  get filteredRequests(): PlatformRequest[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.requests.filter((request) => {
      const matchesCard = this.matchesCardFilter(request);
      const matchesService = this.serviceFilter === 'ALL' || request.serviceType === this.serviceFilter;
      const source = `${request.id} ${request.serviceType} ${request.city} ${request.location} ${request.customerPhone}`.toLowerCase();
      const matchesSearch = !search || source.includes(search);
      return matchesCard && matchesService && matchesSearch;
    });
  }

  get pagedRequests(): PlatformRequest[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  setCardFilter(key: CustomerCard['key']): void {
    this.cardFilter = key;
    this.page = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.serviceFilter = 'ALL';
    this.cardFilter = 'ALL';
    this.page = 1;
  }

  openDetails(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  openEdit(request: PlatformRequest): void {
    this.editRequest = request;
    this.editTitle = request.title;
    this.editLocation = request.location;
    this.editCity = request.city;
    this.editZip = request.zip;
    this.editNotes = request.notes;
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editRequest = null;
  }

  saveEdit(): void {
    if (!this.editRequest) {
      return;
    }

    const updated = this.store.updateRequestDetails(this.editRequest.id, {
      title: this.editTitle,
      location: this.editLocation,
      city: this.editCity,
      zip: this.editZip,
      notes: this.editNotes
    });

    if (!updated) {
      this.notify('Unable to update request details.', 'error');
      return;
    }

    this.load();
    this.closeEdit();
    this.notify(`${updated.id} updated successfully.`, 'success');
  }

  askCancel(request: PlatformRequest): void {
    this.requestToCancel = request;
  }

  cancelRequest(): void {
    if (!this.requestToCancel) {
      return;
    }

    const cancelled = this.store.updateRequestStatus(this.requestToCancel.id, 'CANCELLED');
    if (!cancelled) {
      this.notify('Unable to cancel request.', 'error');
      return;
    }

    this.load();
    this.notify(`${cancelled.id} cancelled.`, 'success');
    this.requestToCancel = null;
  }

  exportRequests(): void {
    if (!this.filteredRequests.length) {
      this.notify('No requests found for export.', 'info');
      return;
    }

    downloadCsv({
      filename: `customer-requests-export-${todayForFileName()}.csv`,
      rows: this.filteredRequests.map((request) => ({
        'Request ID': request.id,
        Service: request.serviceType,
        Status: request.status,
        Urgency: request.urgency,
        Location: request.location,
        'Created At': request.createdAt,
        'Updated At': request.updatedAt
      }))
    });

    this.notify('Request list exported.', 'success');
  }

  downloadSummary(request: PlatformRequest): void {
    downloadCsv({
      filename: `${request.id.toLowerCase()}-summary-${todayForFileName()}.csv`,
      rows: [
        {
          'Request ID': request.id,
          Service: request.serviceType,
          Status: request.status,
          Urgency: request.urgency,
          Location: request.location,
          Notes: request.notes,
          'Created At': request.createdAt
        }
      ]
    });
    this.notify(`${request.id} summary downloaded.`, 'success');
  }

  canEdit(request: PlatformRequest): boolean {
    return ['PENDING', 'MATCHING', 'ASSIGNED'].includes(request.status);
  }

  canCancel(request: PlatformRequest): boolean {
    return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(request.status);
  }

  timelineReached(status: RequestStatus, step: RequestStatus): boolean {
    const currentIndex = this.timelineFlow.indexOf(status);
    const stepIndex = this.timelineFlow.indexOf(step);
    if (currentIndex === -1 || stepIndex === -1) {
      return false;
    }
    return currentIndex >= stepIndex;
  }

  pageChange(next: number): void {
    this.page = next;
  }

  pageSizeChange(next: number): void {
    this.pageSize = next;
    this.page = 1;
  }

  dismissToast(): void {
    this.showToast = false;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private matchesCardFilter(request: PlatformRequest): boolean {
    return this.matchesCardFilterFor(request, this.cardFilter);
  }

  private matchesCardFilterFor(
    request: PlatformRequest,
    filter: 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  ): boolean {
    if (filter === 'ALL') {
      return true;
    }

    if (filter === 'PENDING') {
      return ['PENDING', 'MATCHING'].includes(request.status);
    }

    if (filter === 'ACTIVE') {
      return ['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS'].includes(request.status);
    }

    if (filter === 'COMPLETED') {
      return request.status === 'COMPLETED';
    }

    return ['CANCELLED', 'REJECTED'].includes(request.status);
  }

  private countByFilter(filter: CustomerCard['key']): number {
    return this.requests.filter((request) => this.matchesCardFilterFor(request, filter)).length;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
