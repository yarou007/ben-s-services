import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';

@Component({
  selector: 'app-customer-track-request',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './customer-track-request.component.html'
})
export class CustomerTrackRequestComponent {
  requests: PlatformRequest[] = [];
  selectedRequestId = '';

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

    if (!this.selectedRequestId && this.requests.length) {
      this.selectedRequestId = this.requests[0].id;
    }
  }

  get selectedRequest(): PlatformRequest | null {
    return this.requests.find((request) => request.id === this.selectedRequestId) ?? null;
  }

  get selectedIndex(): number {
    return this.requests.findIndex((request) => request.id === this.selectedRequestId);
  }

  previousRequest(): void {
    if (this.selectedIndex > 0) {
      this.selectedRequestId = this.requests[this.selectedIndex - 1].id;
    }
  }

  nextRequest(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.requests.length - 1) {
      this.selectedRequestId = this.requests[this.selectedIndex + 1].id;
    }
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

  exportCurrent(): void {
    const request = this.selectedRequest;
    if (!request) {
      return;
    }

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

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
