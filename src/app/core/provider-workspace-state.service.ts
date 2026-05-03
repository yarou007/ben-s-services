import { Injectable } from '@angular/core';
import { JobRecord, RequestStatus } from './platform-store.service';

export interface ProviderAvailabilitySlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  enabled: boolean;
  start: string;
  end: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderWorkspaceStateService {
  private readonly rescheduledJobs = new Map<string, string>();

  private availabilitySlots: ProviderAvailabilitySlot[] = [
    { day: 'Mon', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Tue', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Wed', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Thu', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Fri', enabled: true, start: '08:00', end: '18:00' },
    { day: 'Sat', enabled: true, start: '09:00', end: '16:00' },
    { day: 'Sun', enabled: false, start: '09:00', end: '14:00' }
  ];

  listAvailability(): ProviderAvailabilitySlot[] {
    return this.availabilitySlots.map((slot) => ({ ...slot }));
  }

  updateAvailability(nextSlots: ProviderAvailabilitySlot[]): void {
    this.availabilitySlots = nextSlots.map((slot) => ({ ...slot }));
  }

  setReschedule(requestId: string, scheduledIso: string): void {
    this.rescheduledJobs.set(requestId, scheduledIso);
  }

  hasReschedule(requestId: string): boolean {
    return this.rescheduledJobs.has(requestId);
  }

  scheduledAtFor(job: JobRecord, queueIndex: number): Date {
    const manual = this.rescheduledJobs.get(job.requestId);
    if (manual) {
      return new Date(manual);
    }

    return this.estimateSchedule(job, queueIndex);
  }

  private estimateSchedule(job: JobRecord, queueIndex: number): Date {
    const seed = this.hash(`${job.requestId}-${job.status}-${queueIndex}`);
    const date = this.parseCreatedAt(job.createdAt);
    const dayOffset = this.dayOffset(job.status);
    const slotHour = 8 + (seed % 10);
    const slotMinutes = [0, 15, 30, 45][seed % 4];

    date.setDate(date.getDate() + dayOffset);
    date.setHours(slotHour, slotMinutes, 0, 0);
    return date;
  }

  private dayOffset(status: RequestStatus): number {
    const map: Record<RequestStatus, number> = {
      PENDING: 1,
      MATCHING: 1,
      ASSIGNED: 0,
      ACCEPTED_BY_PROVIDER: 0,
      ON_THE_WAY: 0,
      IN_PROGRESS: 0,
      COMPLETED: -1,
      CANCELLED: -1,
      REJECTED: -1
    };

    return map[status] ?? 0;
  }

  private parseCreatedAt(createdAt: string): Date {
    const now = new Date();
    const text = createdAt.trim().toLowerCase();

    if (text.startsWith('today')) {
      const parsed = this.timeFromLabel(createdAt, now);
      return parsed ?? new Date(now);
    }

    if (text.startsWith('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const parsed = this.timeFromLabel(createdAt, yesterday);
      return parsed ?? yesterday;
    }

    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return now;
    }

    return parsedDate;
  }

  private timeFromLabel(label: string, referenceDay: Date): Date | null {
    const rawTime = label.split(' ').slice(1).join(' ').trim();
    if (!rawTime) {
      return null;
    }

    const normalized = rawTime.toUpperCase().replace('.', '');
    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2] ?? '0');
    const period = match[3];

    const date = new Date(referenceDay);
    let converted = hours % 12;
    if (period === 'PM') {
      converted += 12;
    }

    date.setHours(converted, minutes, 0, 0);
    return date;
  }

  private hash(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
