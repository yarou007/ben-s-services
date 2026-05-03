import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';

@Component({
  selector: 'app-customer-track-request',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, StatusBadgeComponent, EmptyStateComponent, PaginationControlsComponent],
  templateUrl: './customer-track-request.component.html'
})
export class CustomerTrackRequestComponent {
  requests: PlatformRequest[] = [];

  searchTerm = '';
  statusFilter: RequestStatus | 'ALL' = 'ALL';
  serviceFilter = 'ALL';

  page = 1;
  pageSize = 6;

  selectedRequest: PlatformRequest | null = null;
  showDetailsModal = false;

  readonly flow: RequestStatus[] = [
    'PENDING',
    'MATCHING',
    'ASSIGNED',
    'ACCEPTED_BY_PROVIDER',
    'ON_THE_WAY',
    'IN_PROGRESS',
    'COMPLETED'
  ];

  constructor(private readonly store: PlatformStoreService) {
    this.load();
  }

  load(): void {
    const customer = this.store.getCustomerContext();
    this.requests = this.store.listCustomerRequests(customer.name);
  }

  get serviceOptions(): string[] {
    return [...new Set(this.requests.map((request) => request.serviceType))].sort((left, right) => left.localeCompare(right));
  }

  get statusOptions(): RequestStatus[] {
    return [...new Set(this.requests.map((request) => request.status))];
  }

  get filteredRequests(): PlatformRequest[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.requests.filter((request) => {
      const matchesStatus = this.statusFilter === 'ALL' || request.status === this.statusFilter;
      const matchesService = this.serviceFilter === 'ALL' || request.serviceType === this.serviceFilter;
      const source = `${request.id} ${request.serviceType} ${request.location} ${request.city} ${request.status}`.toLowerCase();
      const matchesSearch = !search || source.includes(search);
      return matchesStatus && matchesService && matchesSearch;
    });
  }

  get pagedRequests(): PlatformRequest[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.serviceFilter = 'ALL';
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

  reached(step: RequestStatus): boolean {
    const request = this.selectedRequest;
    if (!request) {
      return false;
    }

    const current = this.flow.indexOf(request.status);
    const target = this.flow.indexOf(step);
    if (current === -1 || target === -1) {
      return false;
    }

    return current >= target;
  }

  exportRequest(request: PlatformRequest): void {
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
          'Created At': request.createdAt,
          'Updated At': request.updatedAt
        }
      ]
    });
  }

  pageChange(next: number): void {
    this.page = next;
  }

  pageSizeChange(next: number): void {
    this.pageSize = next;
    this.page = 1;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
