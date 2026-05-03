import { Component } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { JobRecord, PlatformProvider, PlatformStoreService } from '../../core/platform-store.service';
import { ProviderWorkspaceStateService } from '../../core/provider-workspace-state.service';
import { downloadCsv, todayForFileName } from '../../shared/utils/export.util';
import { ProviderEarningsChartComponent } from '../../shared/components/provider-earnings-chart/provider-earnings-chart.component';
import { ProviderCategoryChartComponent } from '../../shared/components/provider-category-chart/provider-category-chart.component';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import { estimateJobHours, estimateJobRevenue } from './provider-portal.utils';

type PeriodMode = 'daily' | 'weekly' | 'monthly';
type BreakdownMode = 'location' | 'employee';

@Component({
  selector: 'app-provider-earnings',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ProviderEarningsChartComponent,
    ProviderCategoryChartComponent,
    ToastMessageComponent
  ],
  templateUrl: './provider-earnings.component.html'
})
export class ProviderEarningsComponent {
  provider: PlatformProvider | null = null;
  jobs: JobRecord[] = [];

  period: PeriodMode = 'weekly';
  breakdownMode: BreakdownMode = 'location';

  showToast = false;
  toastTone: 'success' | 'error' | 'info' = 'info';
  toastMessage = '';

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
    this.reload();
  }

  reload(): void {
    if (!this.provider) {
      this.jobs = [];
      return;
    }

    this.jobs = this.store.listJobsForProvider(this.provider.id);
  }

  get completedJobs(): JobRecord[] {
    return this.jobs.filter((job) => job.status === 'COMPLETED');
  }

  get totalEarnings(): number {
    return this.completedJobs.reduce((total, job) => total + estimateJobRevenue(job), 0);
  }

  get estimatedCost(): number {
    return Math.round(this.totalEarnings * 0.32);
  }

  get profit(): number {
    return this.totalEarnings - this.estimatedCost;
  }

  get profitabilityPercent(): number {
    if (!this.totalEarnings) {
      return 0;
    }
    return Math.round((this.profit / this.totalEarnings) * 100);
  }

  get totalHours(): number {
    return this.completedJobs.reduce((total, job) => total + estimateJobHours(job), 0);
  }

  get earningsPerHour(): number {
    if (!this.totalHours) {
      return 0;
    }
    return Math.round(this.totalEarnings / this.totalHours);
  }

  get previousPeriodEarnings(): number {
    return Math.round(this.totalEarnings * 0.88);
  }

  get earningsTrendLabel(): string {
    return this.deltaLabel(this.totalEarnings, this.previousPeriodEarnings);
  }

  get earningsByPeriod(): Array<{ label: string; value: number }> {
    if (this.period === 'daily') {
      return this.buildDailySeries(7);
    }

    if (this.period === 'weekly') {
      return this.buildWeeklySeries(8);
    }

    return this.buildMonthlySeries(6);
  }

  get revenueByService(): Array<{ label: string; value: number }> {
    const map = new Map<string, number>();
    this.completedJobs.forEach((job) => {
      map.set(job.serviceType, (map.get(job.serviceType) ?? 0) + estimateJobRevenue(job));
    });

    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);
  }

  get revenueByBreakdown(): Array<{ label: string; value: number }> {
    const map = new Map<string, number>();
    this.completedJobs.forEach((job) => {
      const key = this.breakdownMode === 'location' ? job.city : this.employeeFromJob(job);
      map.set(key, (map.get(key) ?? 0) + estimateJobRevenue(job));
    });

    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);
  }

  setPeriod(value: string): void {
    if (value === 'daily' || value === 'weekly' || value === 'monthly') {
      this.period = value;
    }
  }

  setBreakdown(value: string): void {
    if (value === 'location' || value === 'employee') {
      this.breakdownMode = value;
    }
  }

  exportEarnings(): void {
    const rows = this.completedJobs.map((job, index) => ({
      'Request ID': job.requestId,
      Service: job.serviceType,
      Location: job.city,
      Employee: this.employeeFromJob(job),
      Scheduled: this.workspace.scheduledAtFor(job, index).toLocaleString(),
      Revenue: estimateJobRevenue(job),
      'Estimated Hours': estimateJobHours(job)
    }));

    downloadCsv({
      filename: `provider-earnings-${todayForFileName()}.csv`,
      rows
    });

    this.notify('Earnings export is ready.', 'success');
  }

  dismissToast(): void {
    this.showToast = false;
  }

  private buildDailySeries(days: number): Array<{ label: string; value: number }> {
    const now = new Date();
    const labels = Array.from({ length: days }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - index));
      return {
        key: date.toDateString(),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: 0
      };
    });

    this.completedJobs.forEach((job, index) => {
      const scheduled = this.workspace.scheduledAtFor(job, index);
      const bucket = labels.find((entry) => entry.key === scheduled.toDateString());
      if (bucket) {
        bucket.value += estimateJobRevenue(job);
      }
    });

    return labels.map(({ label, value }) => ({ label, value }));
  }

  private buildWeeklySeries(weeks: number): Array<{ label: string; value: number }> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (weeks * 7));
    start.setHours(0, 0, 0, 0);

    const labels = Array.from({ length: weeks }, (_, index) => ({
      label: `W${index + 1}`,
      start: new Date(start.getTime() + (index * 7 * 24 * 60 * 60 * 1000)),
      end: new Date(start.getTime() + ((index + 1) * 7 * 24 * 60 * 60 * 1000)),
      value: 0
    }));

    this.completedJobs.forEach((job, index) => {
      const scheduled = this.workspace.scheduledAtFor(job, index);
      const bucket = labels.find((entry) => scheduled >= entry.start && scheduled < entry.end);
      if (bucket) {
        bucket.value += estimateJobRevenue(job);
      }
    });

    return labels.map(({ label, value }) => ({ label, value }));
  }

  private buildMonthlySeries(months: number): Array<{ label: string; value: number }> {
    const now = new Date();
    const labels = Array.from({ length: months }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
      return {
        month: month.getMonth(),
        year: month.getFullYear(),
        label: month.toLocaleDateString(undefined, { month: 'short' }),
        value: 0
      };
    });

    this.completedJobs.forEach((job, index) => {
      const scheduled = this.workspace.scheduledAtFor(job, index);
      const bucket = labels.find((entry) => entry.month === scheduled.getMonth() && entry.year === scheduled.getFullYear());
      if (bucket) {
        bucket.value += estimateJobRevenue(job);
      }
    });

    return labels.map(({ label, value }) => ({ label, value }));
  }

  private employeeFromJob(job: JobRecord): string {
    const names = ['Lead Tech', 'Field Tech A', 'Field Tech B'];
    const seed = Math.abs(job.requestId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return names[seed % names.length];
  }

  private deltaLabel(current: number, previous: number): string {
    if (!previous) {
      return current ? '+100%' : '0%';
    }

    const delta = ((current - previous) / previous) * 100;
    const symbol = delta > 0 ? '+' : '';
    return `${symbol}${Math.round(delta)}%`;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
