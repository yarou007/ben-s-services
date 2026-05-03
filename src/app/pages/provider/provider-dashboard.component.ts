import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  JobRecord,
  PlatformProvider,
  PlatformStoreService
} from '../../core/platform-store.service';
import { ProviderWorkspaceStateService } from '../../core/provider-workspace-state.service';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { DashboardStatsCardComponent } from '../../shared/components/dashboard-stats-card/dashboard-stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import {
  DetailField,
  DetailsModalComponent
} from '../../shared/components/details-modal/details-modal.component';
import {
  buildEarningsByDay,
  estimateJobRevenue,
  formatDateChip,
  formatTimeChip,
  isSameDay,
  startOfDay
} from './provider-portal.utils';
import { ProviderEarningsChartComponent } from '../../shared/components/provider-earnings-chart/provider-earnings-chart.component';
import { ProviderCategoryChartComponent } from '../../shared/components/provider-category-chart/provider-category-chart.component';

interface DashboardMetricCard {
  label: string;
  value: string;
  note: string;
  comparison: string;
  trend: 'up' | 'down' | 'steady';
}

type DateRangeFilter = 7 | 14 | 30;

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    DashboardStatsCardComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    ToastMessageComponent,
    DetailsModalComponent,
    ProviderEarningsChartComponent,
    ProviderCategoryChartComponent
  ],
  templateUrl: './provider-dashboard.component.html'
})
export class ProviderDashboardComponent {
  provider: PlatformProvider | null = null;
  jobs: JobRecord[] = [];

  chartRange: DateRangeFilter = 14;
  serviceFilter = 'ALL';
  employeeFilter = 'ALL';

  recentCollapsed = false;
  selectedJob: JobRecord | null = null;
  showDetailsModal = false;

  toastMessage = '';
  toastTone: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private readonly store: PlatformStoreService,
    private readonly workspace: ProviderWorkspaceStateService
  ) {
    this.initialize();
  }

  initialize(): void {
    const firstActive = this.store.listProviders().find((provider) => provider.approvalStatus === 'ACTIVE') ?? this.store.listProviders()[0];
    if (!firstActive) {
      return;
    }

    this.provider = firstActive;
    this.refresh();
  }

  refresh(): void {
    if (!this.provider) {
      this.jobs = [];
      return;
    }

    this.jobs = this.store.listJobsForProvider(this.provider.id);
  }

  get summaryCards(): DashboardMetricCard[] {
    const pending = this.pendingJobs.length;
    const active = this.activeJobs.length;
    const scheduledToday = this.todaysSchedule.length;

    const weekly = this.weeklyEarnings;
    const monthly = this.monthlyEarnings;
    const lastWeek = Math.round(weekly * 0.86);
    const lastMonth = Math.round(monthly * 0.9);

    return [
      {
        label: 'Pending Jobs',
        value: pending.toString(),
        note: 'Waiting for acceptance',
        comparison: `${this.formatDelta(pending, Math.max(0, pending - 1))} vs last period`,
        trend: this.trendFromDelta(pending - Math.max(0, pending - 1))
      },
      {
        label: 'Active Jobs',
        value: active.toString(),
        note: 'On the way / in progress',
        comparison: `${this.formatDelta(active, Math.max(0, active - 1))} vs last period`,
        trend: this.trendFromDelta(active - Math.max(0, active - 1))
      },
      {
        label: "Today's Schedule",
        value: scheduledToday.toString(),
        note: 'Jobs planned for today',
        comparison: `${this.formatDelta(scheduledToday, Math.max(0, scheduledToday - 1))} vs yesterday`,
        trend: this.trendFromDelta(scheduledToday - Math.max(0, scheduledToday - 1))
      },
      {
        label: 'Earnings (Week / Month)',
        value: this.currency(monthly),
        note: `Week: ${this.currency(weekly)}`,
        comparison: `${this.formatDelta(weekly, lastWeek)} week · ${this.formatDelta(monthly, lastMonth)} month`,
        trend: this.trendFromDelta((weekly - lastWeek) + (monthly - lastMonth))
      }
    ];
  }

  get pendingJobs(): JobRecord[] {
    return this.jobs.filter((job) => !job.assignedProviderId && ['PENDING', 'MATCHING', 'ASSIGNED'].includes(job.status));
  }

  get activeJobs(): JobRecord[] {
    return this.jobs.filter((job) => ['ACCEPTED_BY_PROVIDER', 'ON_THE_WAY', 'IN_PROGRESS'].includes(job.status));
  }

  get todaysSchedule(): JobRecord[] {
    const today = startOfDay(new Date());
    return this.jobs.filter((job, index) => {
      const scheduled = this.workspace.scheduledAtFor(job, index);
      return isSameDay(scheduled, today);
    });
  }

  get weeklyEarnings(): number {
    return this.filteredJobsForCharts
      .filter((job) => job.status === 'COMPLETED')
      .reduce((total, job) => total + estimateJobRevenue(job), 0);
  }

  get monthlyEarnings(): number {
    return Math.round(this.weeklyEarnings * 4.15);
  }

  get serviceOptions(): string[] {
    return [...new Set(this.jobs.map((job) => job.serviceType))];
  }

  get employeeOptions(): string[] {
    return ['Lead Tech', 'Field Tech A', 'Field Tech B'];
  }

  get filteredJobsForCharts(): JobRecord[] {
    const now = new Date();
    const rangeStart = startOfDay(now);
    rangeStart.setDate(rangeStart.getDate() - (this.chartRange - 1));

    return this.jobs.filter((job, index) => {
      const serviceMatch = this.serviceFilter === 'ALL' || job.serviceType === this.serviceFilter;
      const employeeMatch = this.employeeFilter === 'ALL' || this.employeeFromJob(job) === this.employeeFilter;
      const scheduleDate = this.workspace.scheduledAtFor(job, index);
      const rangeMatch = scheduleDate >= rangeStart && scheduleDate <= now;
      return serviceMatch && employeeMatch && rangeMatch;
    });
  }

  get earningsChartPoints(): Array<{ label: string; value: number }> {
    return buildEarningsByDay(this.filteredJobsForCharts, this.workspace, this.chartRange);
  }

  get serviceCategoryBars(): Array<{ label: string; value: number }> {
    const map = new Map<string, number>();
    this.filteredJobsForCharts.forEach((job) => {
      map.set(job.serviceType, (map.get(job.serviceType) ?? 0) + 1);
    });

    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);
  }

  get recentJobs(): JobRecord[] {
    return [...this.jobs]
      .sort((left, right) => {
        const leftDate = this.workspace.scheduledAtFor(left, this.jobs.indexOf(left)).getTime();
        const rightDate = this.workspace.scheduledAtFor(right, this.jobs.indexOf(right)).getTime();
        return rightDate - leftDate;
      })
      .slice(0, 12);
  }

  get detailsFields(): DetailField[] {
    if (!this.selectedJob) {
      return [];
    }

    const index = this.jobs.findIndex((job) => job.requestId === this.selectedJob?.requestId);
    const scheduled = this.workspace.scheduledAtFor(this.selectedJob, Math.max(0, index));

    return [
      { label: 'Job ID', value: this.selectedJob.id },
      { label: 'Request ID', value: this.selectedJob.requestId },
      { label: 'Customer', value: this.selectedJob.customerName },
      { label: 'Service', value: this.selectedJob.serviceType },
      { label: 'Status', value: this.selectedJob.status.replace(/_/g, ' ') },
      { label: 'Location', value: this.selectedJob.location },
      { label: 'Scheduled', value: `${formatDateChip(scheduled)} at ${formatTimeChip(scheduled)}` }
    ];
  }

  updateRange(value: string): void {
    const next = Number(value) as DateRangeFilter;
    if (next === 7 || next === 14 || next === 30) {
      this.chartRange = next;
    }
  }

  toggleRecentJobs(): void {
    this.recentCollapsed = !this.recentCollapsed;
  }

  openDetails(job: JobRecord): void {
    this.selectedJob = job;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedJob = null;
  }

  markComplete(job: JobRecord): void {
    if (!this.canMarkComplete(job)) {
      return;
    }

    const updated = this.store.updateRequestStatus(job.requestId, 'COMPLETED');
    if (!updated) {
      this.notify('Unable to mark this job as completed.', 'error');
      return;
    }

    this.refresh();
    this.notify(`${job.id} marked as completed.`, 'success');
  }

  canMarkComplete(job: JobRecord): boolean {
    return ['ON_THE_WAY', 'IN_PROGRESS', 'ACCEPTED_BY_PROVIDER', 'ASSIGNED'].includes(job.status);
  }

  scheduledLabel(job: JobRecord): string {
    const index = this.jobs.findIndex((entry) => entry.requestId === job.requestId);
    const scheduled = this.workspace.scheduledAtFor(job, Math.max(0, index));
    return `${formatDateChip(scheduled)} · ${formatTimeChip(scheduled)}`;
  }

  exportDashboardData(): void {
    const rows = this.recentJobs.map((job) => ({
      'Job ID': job.id,
      Customer: job.customerName,
      Service: job.serviceType,
      Status: job.status,
      Scheduled: this.scheduledLabel(job),
      'Est. Revenue': estimateJobRevenue(job)
    }));

    downloadCsv({
      filename: `provider-dashboard-${todayForFileName()}.csv`,
      rows
    });

    this.notify('Dashboard data exported.', 'info');
  }

  dismissToast(): void {
    this.showToast = false;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }

  private currency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  private employeeFromJob(job: JobRecord): string {
    const employees = this.employeeOptions;
    const seed = Math.abs(job.requestId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return employees[seed % employees.length];
  }

  private formatDelta(current: number, previous: number): string {
    if (previous <= 0) {
      return current > 0 ? '+100%' : '0%';
    }

    const delta = ((current - previous) / previous) * 100;
    const symbol = delta > 0 ? '+' : '';
    return `${symbol}${Math.round(delta)}%`;
  }

  private trendFromDelta(delta: number): 'up' | 'down' | 'steady' {
    if (delta > 0) {
      return 'up';
    }
    if (delta < 0) {
      return 'down';
    }
    return 'steady';
  }
}
