import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PlatformRequest, PlatformStoreService } from '../../core/platform-store.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';

interface CustomerRecord {
  name: string;
  email: string;
  phone: string;
  requestsCount: number;
  lastStatus: string;
  lastUpdated: string;
  cities: string[];
}

@Component({
  selector: 'app-admin-crm',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    PaginationControlsComponent,
    ToastMessageComponent,
    DetailsModalComponent
  ],
  templateUrl: './admin-crm.component.html'
})
export class AdminCrmComponent {
  records: CustomerRecord[] = [];

  searchTerm = '';
  statusFilter = 'ALL';

  page = 1;
  pageSize = 6;

  selectedRecord: CustomerRecord | null = null;
  showDetailsModal = false;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(private readonly store: PlatformStoreService) {
    this.load();
  }

  load(): void {
    const requests = this.store.listRequests();
    this.records = this.buildRecords(requests);
  }

  get filteredRecords(): CustomerRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.records.filter((record) => {
      const matchesStatus = this.statusFilter === 'ALL' || record.lastStatus === this.statusFilter;
      const source = `${record.name} ${record.email} ${record.phone} ${record.cities.join(' ')}`.toLowerCase();
      const matchesSearch = !search || source.includes(search);
      return matchesStatus && matchesSearch;
    });
  }

  get pagedRecords(): CustomerRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  get statusOptions(): string[] {
    return [...new Set(this.records.map((record) => record.lastStatus))];
  }

  get detailsFields(): DetailField[] {
    if (!this.selectedRecord) {
      return [];
    }

    return [
      { label: 'Phone', value: this.selectedRecord.phone },
      { label: 'Requests Count', value: this.selectedRecord.requestsCount.toString() },
      { label: 'Last Status', value: this.formatStatus(this.selectedRecord.lastStatus) },
      { label: 'Last Updated', value: this.selectedRecord.lastUpdated },
      { label: 'Cities', value: this.selectedRecord.cities.join(', ') }
    ];
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.page = 1;
  }

  exportRecords(): void {
    if (!this.filteredRecords.length) {
      this.notify('No customer rows available for export.', 'info');
      return;
    }

    downloadCsv({
      filename: `customers-export-${todayForFileName()}.csv`,
      rows: this.filteredRecords.map((record) => ({
        Name: record.name,
        Email: record.email,
        Phone: record.phone,
        'Requests Count': record.requestsCount,
        'Last Status': record.lastStatus,
        'Last Updated': record.lastUpdated,
        Cities: record.cities.join(' | ')
      }))
    });

    this.notify('Customer export completed.', 'success');
  }

  openDetails(record: CustomerRecord): void {
    this.selectedRecord = record;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedRecord = null;
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

  private buildRecords(requests: PlatformRequest[]): CustomerRecord[] {
    const grouped = new Map<string, PlatformRequest[]>();

    requests.forEach((request) => {
      const items = grouped.get(request.customerName) ?? [];
      items.push(request);
      grouped.set(request.customerName, items);
    });

    return [...grouped.entries()].map(([name, customerRequests]) => {
      const latest = customerRequests[0];
      return {
        name,
        email: latest.customerEmail,
        phone: latest.customerPhone,
        requestsCount: customerRequests.length,
        lastStatus: latest.status,
        lastUpdated: latest.updatedAt,
        cities: [...new Set(customerRequests.map((request) => request.city))]
      };
    });
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
