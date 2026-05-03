import { JobRecord } from '../../core/platform-store.service';
import { ProviderWorkspaceStateService } from '../../core/provider-workspace-state.service';

export interface EarningsBucket {
  label: string;
  value: number;
}

export function estimateJobRevenue(job: JobRecord): number {
  const baseByService: Record<string, number> = {
    Locksmith: 180,
    'Glass Repair': 280,
    'Commercial Door': 240
  };

  const urgencyFactor: Record<string, number> = {
    Low: 0.85,
    Medium: 1,
    High: 1.25,
    Emergency: 1.6
  };

  const base = baseByService[job.serviceType] ?? 200;
  const multiplier = urgencyFactor[job.urgency] ?? 1;

  return Math.round(base * multiplier);
}

export function estimateJobHours(job: JobRecord): number {
  const hoursByService: Record<string, number> = {
    Locksmith: 1.2,
    'Glass Repair': 2.1,
    'Commercial Door': 1.8
  };

  const urgencyFactor: Record<string, number> = {
    Low: 0.8,
    Medium: 1,
    High: 1.15,
    Emergency: 1.3
  };

  const base = hoursByService[job.serviceType] ?? 1.4;
  const multiplier = urgencyFactor[job.urgency] ?? 1;
  return Number((base * multiplier).toFixed(1));
}

export function isJobClosed(job: JobRecord): boolean {
  return ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(job.status);
}

export function formatDateChip(value: Date): string {
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTimeChip(value: Date): string {
  return value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function isSameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

export function startOfDay(value: Date): Date {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function buildEarningsByDay(
  jobs: JobRecord[],
  workspace: ProviderWorkspaceStateService,
  windowDays: number
): EarningsBucket[] {
  const now = new Date();
  const start = startOfDay(now);
  start.setDate(start.getDate() - (windowDays - 1));

  const buckets = Array.from({ length: windowDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return {
      key: date.toDateString(),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: 0
    };
  });

  jobs.forEach((job, index) => {
    if (!isJobClosed(job)) {
      return;
    }

    const scheduled = workspace.scheduledAtFor(job, index);
    const match = buckets.find((bucket) => bucket.key === scheduled.toDateString());
    if (match) {
      match.value += estimateJobRevenue(job);
    }
  });

  return buckets.map((bucket) => ({ label: bucket.label, value: bucket.value }));
}
