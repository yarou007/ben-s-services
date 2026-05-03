import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RequestItem, adminRequests } from '../../core/mock-data';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './admin-requests.component.html'
})
export class AdminRequestsComponent {
  allRequests: RequestItem[] = [...adminRequests];
  requests: RequestItem[] = [...adminRequests];
  searchTerm = '';
  feedback = '';
  selectedRequestId = '';
  statusFilter: 'All' | 'Open' | 'In Review' | 'Assigned' | 'Resolved' = 'All';

  statusClass(status: string): string {
    if (status === 'Assigned') {
      return 'pill pill-blue';
    }
    if (status === 'In Review') {
      return 'pill pill-orange';
    }
    if (status === 'Resolved') {
      return 'pill pill-ink';
    }
    return 'pill pill-ink';
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applyFilters();
  }

  cycleFilter(): void {
    const order: Array<'All' | 'Open' | 'In Review' | 'Assigned' | 'Resolved'> = [
      'All',
      'Open',
      'In Review',
      'Assigned',
      'Resolved'
    ];
    const current = order.indexOf(this.statusFilter);
    this.statusFilter = order[(current + 1) % order.length];
    this.applyFilters();
    this.feedback = `Filter switched to: ${this.statusFilter}.`;
  }

  createRequest(): void {
    const nextIndex = this.allRequests.length + 1;
    const mockRequest: RequestItem = {
      id: `REQ-31${(100 + nextIndex).toString().slice(1)}`,
      title: `New service request #${nextIndex}`,
      category: nextIndex % 2 === 0 ? 'Glass Repair' : 'Locksmith',
      status: 'Open',
      sla: '6 hours',
      owner: 'Dispatch Demo',
      location: 'Manhattan, NY',
      customer: 'Walk-in customer',
      accountType: 'Residential',
      priority: 'Medium',
      createdAt: 'Just now'
    };
    this.allRequests = [mockRequest, ...this.allRequests];
    this.applyFilters();
    this.feedback = `${mockRequest.id} created successfully (demo mode).`;
  }

  assignRequest(request: RequestItem): void {
    request.status = 'Assigned';
    request.owner = 'Dispatch Demo';
    this.feedback = `${request.id} assigned to Dispatch Demo team.`;
    this.applyFilters();
  }

  viewRequest(request: RequestItem): void {
    this.selectedRequestId = request.id;
    this.feedback = `Viewing ${request.id}: ${request.title}.`;
  }

  rejectRequest(request: RequestItem): void {
    request.status = 'In Review';
    request.owner = 'Quality Desk';
    this.feedback = `${request.id} sent back to review for validation.`;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.requests = this.allRequests.filter((request) => {
      const matchesStatus =
        this.statusFilter === 'All' || request.status === this.statusFilter;
      const searchSource = `${request.id} ${request.title} ${request.customer ?? ''} ${request.location ?? ''}`.toLowerCase();
      const matchesSearch = !this.searchTerm || searchSource.includes(this.searchTerm);
      return matchesStatus && matchesSearch;
    });
  }
}
