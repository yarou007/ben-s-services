import { Component, HostListener } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  PlatformProvider,
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DashboardStatsCardComponent } from '../../shared/components/dashboard-stats-card/dashboard-stats-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';

interface AdminStatCard {
  key: 'ALL' | RequestStatus | 'ACTIVE_PROVIDERS' | 'CUSTOMERS';
  label: string;
  value: number;
  note: string;
  trend: 'up' | 'down' | 'steady';
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    PageHeaderComponent,
    DashboardStatsCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    DetailsModalComponent,
    ConfirmDialogComponent,
    PaginationControlsComponent,
    ToastMessageComponent
  ],
  templateUrl: './admin-requests.component.html'
})
export class AdminRequestsComponent {
  loading = true;
  errorMessage = '';

  allRequests: PlatformRequest[] = [];
  providers: PlatformProvider[] = [];

  searchTerm = '';
  statusFilter: RequestStatus | 'ALL' = 'ALL';
  serviceFilter = 'ALL';
  urgencyFilter = 'ALL';
  cityFilter = 'ALL';

  sortBy: 'id' | 'serviceType' | 'customerName' | 'city' | 'urgency' | 'status' | 'createdAt' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  page = 1;
  pageSize = 5;

  selectedRequest: PlatformRequest | null = null;
  selectedStatus: RequestStatus = 'PENDING';
  selectedProviderId = '';

  showDetailsModal = false;
  showStatusModal = false;
  showAssignModal = false;
  showCancelDialog = false;

  dialogLoading = false;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  readonly lifecycleStatuses: RequestStatus[] = [
    'PENDING',
    'MATCHING',
    'ASSIGNED',
    'ACCEPTED_BY_PROVIDER',
    'ON_THE_WAY',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ];

  constructor(
    private readonly store: PlatformStoreService,
    private readonly route: ActivatedRoute
  ) {
    const initialStatus = this.route.snapshot.queryParamMap.get('status');
    if (initialStatus && (initialStatus === 'ALL' || this.lifecycleStatuses.includes(initialStatus as RequestStatus))) {
      this.statusFilter = initialStatus as RequestStatus | 'ALL';
    }

    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.providers = this.store.listProviders();
      this.allRequests = this.store.listRequests();
      this.loading = false;
      this.ensurePageInRange();
    } catch {
      this.loading = false;
      this.errorMessage = 'Unable to load request records. Try again.';
    }
  }

  get filteredRequests(): PlatformRequest[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.allRequests.filter((request) => {
      const matchesStatus = this.statusFilter === 'ALL' || request.status === this.statusFilter;
      const matchesService = this.serviceFilter === 'ALL' || request.serviceType === this.serviceFilter;
      const matchesUrgency = this.urgencyFilter === 'ALL' || request.urgency === this.urgencyFilter;
      const matchesCity = this.cityFilter === 'ALL' || request.city === this.cityFilter;

      const searchSource = [
        request.id,
        request.customerName,
        request.serviceType,
        request.city,
        request.location,
        request.customerPhone,
        request.customerEmail
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || searchSource.includes(search);
      return matchesStatus && matchesService && matchesUrgency && matchesCity && matchesSearch;
    });
  }

  get sortedRequests(): PlatformRequest[] {
    const requests = [...this.filteredRequests];

    requests.sort((left, right) => {
      const leftValue = String(left[this.sortBy] ?? '').toLowerCase();
      const rightValue = String(right[this.sortBy] ?? '').toLowerCase();
      const comparison = leftValue.localeCompare(rightValue);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return requests;
  }

  get pagedRequests(): PlatformRequest[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedRequests.slice(start, start + this.pageSize);
  }

  get totalRows(): number {
    return this.sortedRequests.length;
  }

  get serviceOptions(): string[] {
    return this.uniqueValues(this.allRequests.map((request) => request.serviceType));
  }

  get cityOptions(): string[] {
    return this.uniqueValues(this.allRequests.map((request) => request.city));
  }

  get urgencyOptions(): string[] {
    return this.uniqueValues(this.allRequests.map((request) => request.urgency));
  }

  get statCards(): AdminStatCard[] {
    const total = this.allRequests.length;
    const pending = this.countByStatus('PENDING') + this.countByStatus('MATCHING');
    const assigned = this.countByStatus('ASSIGNED') + this.countByStatus('ACCEPTED_BY_PROVIDER');
    const completed = this.countByStatus('COMPLETED');
    const cancelled = this.countByStatus('CANCELLED') + this.countByStatus('REJECTED');
    const activeProviders = this.providers.filter((provider) => provider.approvalStatus === 'ACTIVE').length;
    const customerCount = new Set(this.allRequests.map((request) => request.customerName)).size;

    return [
      { key: 'ALL', label: 'Total Requests', value: total, note: 'Across all statuses', trend: 'steady' },
      { key: 'PENDING', label: 'Pending Requests', value: pending, note: 'Needs dispatch attention', trend: 'up' },
      { key: 'ASSIGNED', label: 'Assigned Requests', value: assigned, note: 'In provider lifecycle', trend: 'steady' },
      { key: 'COMPLETED', label: 'Completed Requests', value: completed, note: 'Closed successfully', trend: 'up' },
      { key: 'CANCELLED', label: 'Cancelled Requests', value: cancelled, note: 'Cancelled or rejected', trend: 'down' },
      { key: 'ACTIVE_PROVIDERS', label: 'Active Providers', value: activeProviders, note: 'Ready to accept jobs', trend: 'steady' },
      { key: 'CUSTOMERS', label: 'Customers', value: customerCount, note: 'Unique accounts', trend: 'up' }
    ];
  }

  setSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
  }

  applyStatusFilter(status: RequestStatus | 'ALL'): void {
    this.statusFilter = status;
    this.page = 1;
  }

  setSort(column: 'id' | 'serviceType' | 'customerName' | 'city' | 'urgency' | 'status' | 'createdAt'): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.serviceFilter = 'ALL';
    this.urgencyFilter = 'ALL';
    this.cityFilter = 'ALL';
    this.sortBy = 'createdAt';
    this.sortDirection = 'desc';
    this.page = 1;
    this.notify('Filters reset.', 'info');
  }

  refreshData(): void {
    this.load();
    this.notify('Request data refreshed.', 'info');
  }

  openDetails(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  openStatusModal(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.selectedStatus = request.status;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedRequest = null;
  }

  saveStatus(): void {
    if (!this.selectedRequest) {
      return;
    }

    const updated = this.store.updateRequestStatus(this.selectedRequest.id, this.selectedStatus);
    if (!updated) {
      this.notify('Unable to update request status.', 'error');
      return;
    }

    this.load();
    this.showStatusModal = false;
    this.notify(`${updated.id} status updated to ${updated.status.replace(/_/g, ' ')}.`, 'success');
  }

  openAssignModal(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.selectedProviderId = request.assignedProviderId ?? '';
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedRequest = null;
  }

  saveAssignment(): void {
    if (!this.selectedRequest || !this.selectedProviderId) {
      return;
    }

    const updated = this.store.assignProvider(this.selectedRequest.id, this.selectedProviderId);
    if (!updated) {
      this.notify('Provider assignment failed.', 'error');
      return;
    }

    this.load();
    this.showAssignModal = false;

    const providerName = this.providers.find((provider) => provider.id === this.selectedProviderId)?.name ?? 'Provider';
    this.notify(`${providerName} assigned to ${updated.id}.`, 'success');
  }

  openCancelDialog(request: PlatformRequest): void {
    this.selectedRequest = request;
    this.showCancelDialog = true;
  }

  closeCancelDialog(): void {
    if (this.dialogLoading) {
      return;
    }
    this.showCancelDialog = false;
    this.selectedRequest = null;
  }

  confirmCancelRequest(): void {
    if (!this.selectedRequest) {
      return;
    }

    this.dialogLoading = true;

    const updated = this.store.updateRequestStatus(this.selectedRequest.id, 'CANCELLED');
    this.dialogLoading = false;

    if (!updated) {
      this.notify('Unable to cancel request.', 'error');
      return;
    }

    this.load();
    this.showCancelDialog = false;
    this.notify(`${updated.id} cancelled successfully.`, 'success');
  }

  exportFiltered(): void {
    const data = this.sortedRequests;
    if (!data.length) {
      this.notify('No rows to export for the current filters.', 'info');
      return;
    }

    this.exportRows(data, `requests-export-${todayForFileName()}.csv`);
    this.notify('Filtered request export completed.', 'success');
  }

  exportAllLoaded(): void {
    if (!this.allRequests.length) {
      this.notify('No rows to export.', 'info');
      return;
    }

    this.exportRows(this.allRequests, `requests-export-all-${todayForFileName()}.csv`);
    this.notify('All loaded requests exported.', 'success');
  }

  exportSingle(request: PlatformRequest): void {
    this.exportRows([request], `${request.id.toLowerCase()}-summary-${todayForFileName()}.csv`);
    this.notify(`${request.id} summary downloaded.`, 'success');
  }

  pageChange(nextPage: number): void {
    this.page = nextPage;
  }

  pageSizeChange(nextSize: number): void {
    this.pageSize = nextSize;
    this.page = 1;
  }

  providerName(providerId: string | null): string {
    if (!providerId) {
      return 'Unassigned';
    }
    return this.providers.find((provider) => provider.id === providerId)?.name ?? 'Unknown';
  }

  canAssign(request: PlatformRequest): boolean {
    return ['PENDING', 'MATCHING', 'ASSIGNED'].includes(request.status);
  }

  getStatusOptions(request: PlatformRequest | null): RequestStatus[] {
    if (!request) {
      return [];
    }

    const transitions: Record<RequestStatus, RequestStatus[]> = {
      PENDING: ['PENDING', 'MATCHING', 'ASSIGNED', 'CANCELLED'],
      MATCHING: ['MATCHING', 'ASSIGNED', 'REJECTED', 'CANCELLED'],
      ASSIGNED: ['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'CANCELLED'],
      ACCEPTED_BY_PROVIDER: ['ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS', 'CANCELLED'],
      ON_THE_WAY: ['ON_THE_WAY', 'IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      COMPLETED: ['COMPLETED'],
      CANCELLED: ['CANCELLED'],
      REJECTED: ['REJECTED', 'MATCHING']
    };

    return transitions[request.status] ?? [request.status];
  }

  get selectedRequestFields(): DetailField[] {
    if (!this.selectedRequest) {
      return [];
    }

    return [
      { label: 'Request ID', value: this.selectedRequest.id },
      { label: 'Service', value: this.selectedRequest.serviceType },
      { label: 'Status', value: this.formatStatus(this.selectedRequest.status) },
      { label: 'Urgency', value: this.selectedRequest.urgency },
      { label: 'Customer', value: this.selectedRequest.customerName },
      { label: 'Email', value: this.selectedRequest.customerEmail },
      { label: 'Phone', value: this.selectedRequest.customerPhone },
      { label: 'Location', value: this.selectedRequest.location },
      { label: 'Assigned Provider', value: this.providerName(this.selectedRequest.assignedProviderId) },
      { label: 'Created', value: this.selectedRequest.createdAt },
      { label: 'Notes', value: this.selectedRequest.notes }
    ];
  }

  dismissToast(): void {
    this.showToast = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showStatusModal) {
      this.closeStatusModal();
    }
    if (this.showAssignModal) {
      this.closeAssignModal();
    }
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private exportRows(rows: PlatformRequest[], filename: string): void {
    downloadCsv({
      filename,
      rows: rows.map((row) => ({
        'Request ID': row.id,
        'Service Type': row.serviceType,
        Customer: row.customerName,
        City: row.city,
        ZIP: row.zip,
        Urgency: row.urgency,
        Status: row.status,
        'Assigned Provider': this.providerName(row.assignedProviderId),
        'Created At': row.createdAt,
        'Updated At': row.updatedAt
      }))
    });
  }

  private countByStatus(status: RequestStatus): number {
    return this.allRequests.filter((request) => request.status === status).length;
  }

  private uniqueValues(values: string[]): string[] {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
  }

  private ensurePageInRange(): void {
    const pages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
    this.page = Math.min(this.page, pages);
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
