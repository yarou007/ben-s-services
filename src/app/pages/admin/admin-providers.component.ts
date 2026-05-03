import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  PlatformProvider,
  PlatformStoreService
} from '../../core/platform-store.service';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-controls/pagination-controls.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';

@Component({
  selector: 'app-admin-providers',
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
  templateUrl: './admin-providers.component.html'
})
export class AdminProvidersComponent {
  providers: PlatformProvider[] = [];
  searchTerm = '';
  statusFilter = 'ALL';
  serviceFilter = 'ALL';

  page = 1;
  pageSize = 6;

  selectedProvider: PlatformProvider | null = null;
  showDetailsModal = false;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(private readonly store: PlatformStoreService) {
    this.load();
  }

  load(): void {
    this.providers = this.store.listProviders();
  }

  get serviceOptions(): string[] {
    return [...new Set(this.providers.flatMap((provider) => provider.services))];
  }

  get filteredProviders(): PlatformProvider[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.providers.filter((provider) => {
      const matchesStatus = this.statusFilter === 'ALL' || provider.approvalStatus === this.statusFilter;
      const matchesService = this.serviceFilter === 'ALL' || provider.services.includes(this.serviceFilter);
      const source = `${provider.name} ${provider.serviceArea} ${provider.services.join(' ')}`.toLowerCase();
      const matchesSearch = !search || source.includes(search);
      return matchesStatus && matchesService && matchesSearch;
    });
  }

  get pagedProviders(): PlatformProvider[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProviders.slice(start, start + this.pageSize);
  }

  get detailsFields(): DetailField[] {
    if (!this.selectedProvider) {
      return [];
    }

    return [
      { label: 'Provider Name', value: this.selectedProvider.name },
      { label: 'Services', value: this.selectedProvider.services.join(', ') },
      { label: 'Service Area', value: this.selectedProvider.serviceArea },
      { label: 'Approval', value: this.selectedProvider.approvalStatus.replace('_', ' ') },
      { label: 'Availability', value: this.selectedProvider.availability },
      { label: 'Rating', value: this.selectedProvider.rating.toFixed(1) },
      { label: 'Response Time', value: this.selectedProvider.responseTime },
      { label: 'Jobs Completed', value: this.selectedProvider.jobsCompleted.toString() }
    ];
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.serviceFilter = 'ALL';
    this.page = 1;
  }

  openDetails(provider: PlatformProvider): void {
    this.selectedProvider = provider;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedProvider = null;
  }

  approve(provider: PlatformProvider): void {
    const result = this.store.approveProvider(provider.id);
    if (!result) {
      this.notify('Unable to approve provider.', 'error');
      return;
    }

    this.load();
    this.notify(`${result.name} approved.`, 'success');
  }

  reject(provider: PlatformProvider): void {
    const result = this.store.rejectProvider(provider.id);
    if (!result) {
      this.notify('Unable to reject provider.', 'error');
      return;
    }

    this.load();
    this.notify(`${result.name} rejected.`, 'success');
  }

  exportProviders(): void {
    if (!this.filteredProviders.length) {
      this.notify('No providers available for export.', 'info');
      return;
    }

    downloadCsv({
      filename: `providers-export-${todayForFileName()}.csv`,
      rows: this.filteredProviders.map((provider) => ({
        'Provider Name': provider.name,
        Services: provider.services.join(' | '),
        'Service Area': provider.serviceArea,
        Approval: provider.approvalStatus,
        Availability: provider.availability,
        Rating: provider.rating,
        'Response Time': provider.responseTime,
        'Jobs Completed': provider.jobsCompleted
      }))
    });

    this.notify('Provider export completed.', 'success');
  }

  inviteProvider(): void {
    this.notify('Feature not available yet: backend invitation flow is missing.', 'info');
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

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
