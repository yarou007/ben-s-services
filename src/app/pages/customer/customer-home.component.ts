import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PlatformRequest,
  PlatformStoreService,
  RequestStatus
} from '../../core/platform-store.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import { FeedbackWidgetComponent } from '../../shared/components/feedback-widget/feedback-widget.component';

interface CustomerMetric {
  label: string;
  value: number;
  subtitle: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange' | 'slate';
  route: string;
}

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    RouterLink,
    StatusBadgeComponent,
    EmptyStateComponent,
    DetailsModalComponent,
    FeedbackWidgetComponent
  ],
  templateUrl: './customer-home.component.html'
})
export class CustomerHomeComponent {
  requests: PlatformRequest[] = [];

  customer = {
    name: '',
    email: '',
    phone: ''
  };

  selectedRequest: PlatformRequest | null = null;
  showDetailsModal = false;

  constructor(private readonly store: PlatformStoreService) {
    this.customer = this.store.getCustomerContext();
    this.load();
  }

  load(): void {
    this.requests = this.store.listCustomerRequests(this.customer.name);
  }

  get metrics(): CustomerMetric[] {
    const open = this.countStatuses(['PENDING', 'MATCHING']);
    const active = this.countStatuses(['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS']);
    const completed = this.countStatuses(['COMPLETED']);
    const upcoming = this.countStatuses(['ASSIGNED', 'ACCEPTED_BY_PROVIDER', 'ON_THE_WAY']);

    return [
      {
        label: 'Open Requests',
        value: open,
        subtitle: 'Awaiting first response',
        icon: '📝',
        tone: 'blue',
        route: '/customer/track-request'
      },
      {
        label: 'Active Requests',
        value: active,
        subtitle: 'Currently being handled',
        icon: '🛠',
        tone: 'orange',
        route: '/customer/track-request'
      },
      {
        label: 'Upcoming Appointments',
        value: upcoming,
        subtitle: 'Provider ETA pending/comms',
        icon: '📅',
        tone: 'green',
        route: '/customer/track-request'
      },
      {
        label: 'Completed',
        value: completed,
        subtitle: 'Closed successfully',
        icon: '✅',
        tone: 'slate',
        route: '/customer/track-request'
      }
    ];
  }

  get recentRequests(): PlatformRequest[] {
    return this.requests.slice(0, 5);
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
      { label: 'Address', value: this.selectedRequest.location },
      { label: 'City', value: this.selectedRequest.city },
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

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  metricToneClass(tone: CustomerMetric['tone']): string {
    if (tone === 'green') {
      return 'border-emerald-200 bg-emerald-50';
    }
    if (tone === 'orange') {
      return 'border-orange-200 bg-orange-50';
    }
    if (tone === 'slate') {
      return 'border-slate-300 bg-slate-50';
    }
    return 'border-brand-200 bg-brand-50';
  }

  private countStatuses(statuses: RequestStatus[]): number {
    return this.requests.filter((request) => statuses.includes(request.status)).length;
  }
}
