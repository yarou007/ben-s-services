import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { JobRecord, PlatformProvider, PlatformStoreService } from '../../core/platform-store.service';
import {
  ProviderAvailabilitySlot,
  ProviderWorkspaceStateService
} from '../../core/provider-workspace-state.service';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';
import { formatTimeChip } from './provider-portal.utils';

type CalendarView = 'day' | 'week' | 'month';

interface ScheduledJob {
  job: JobRecord;
  scheduledAt: Date;
}

@Component({
  selector: 'app-provider-calendar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ToastMessageComponent],
  templateUrl: './provider-calendar.component.html'
})
export class ProviderCalendarComponent {
  provider: PlatformProvider | null = null;
  jobs: JobRecord[] = [];

  view: CalendarView = 'week';
  anchorDate = new Date();

  availability: ProviderAvailabilitySlot[] = [];
  rescheduleRequestId = '';
  rescheduleDate = '';
  rescheduleTime = '';

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
    this.availability = this.workspace.listAvailability();
    this.reloadJobs();
  }

  reloadJobs(): void {
    if (!this.provider) {
      this.jobs = [];
      return;
    }
    this.jobs = this.store.listJobsForProvider(this.provider.id);
  }

  get scheduledJobs(): ScheduledJob[] {
    return this.jobs
      .map((job, index) => ({
        job,
        scheduledAt: this.workspace.scheduledAtFor(job, index)
      }))
      .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime());
  }

  get daySlots(): Array<{ hour: number; jobs: ScheduledJob[] }> {
    const hours = Array.from({ length: 12 }, (_, index) => index + 8);
    return hours.map((hour) => ({
      hour,
      jobs: this.scheduledJobs.filter((entry) => this.sameDay(entry.scheduledAt, this.anchorDate) && entry.scheduledAt.getHours() === hour)
    }));
  }

  get weekDays(): Date[] {
    const start = new Date(this.anchorDate);
    const weekday = start.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }

  get monthCells(): Array<{ date: Date; inMonth: boolean; jobs: ScheduledJob[] }> {
    const monthStart = new Date(this.anchorDate.getFullYear(), this.anchorDate.getMonth(), 1);
    const monthEnd = new Date(this.anchorDate.getFullYear(), this.anchorDate.getMonth() + 1, 0);

    const gridStart = new Date(monthStart);
    const shift = gridStart.getDay() === 0 ? -6 : 1 - gridStart.getDay();
    gridStart.setDate(gridStart.getDate() + shift);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return {
        date: day,
        inMonth: day.getMonth() === this.anchorDate.getMonth(),
        jobs: this.scheduledJobs.filter((entry) => this.sameDay(entry.scheduledAt, day))
      };
    }).filter((cell) => cell.date <= monthEnd || cell.inMonth);
  }

  get title(): string {
    if (this.view === 'day') {
      return this.anchorDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }
    if (this.view === 'week') {
      const week = this.weekDays;
      const first = week[0];
      const last = week[6];
      return `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }

    return this.anchorDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  get rescheduleOptions(): ScheduledJob[] {
    return this.scheduledJobs.filter((entry) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(entry.job.status));
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  shiftWindow(step: number): void {
    if (this.view === 'day') {
      this.anchorDate.setDate(this.anchorDate.getDate() + step);
    } else if (this.view === 'week') {
      this.anchorDate.setDate(this.anchorDate.getDate() + (step * 7));
    } else {
      this.anchorDate.setMonth(this.anchorDate.getMonth() + step);
    }

    this.anchorDate = new Date(this.anchorDate);
  }

  jobsForDay(date: Date): ScheduledJob[] {
    return this.scheduledJobs.filter((entry) => this.sameDay(entry.scheduledAt, date));
  }

  saveAvailability(): void {
    this.workspace.updateAvailability(this.availability);
    this.notify('Availability updated.', 'success');
  }

  toggleAvailability(day: ProviderAvailabilitySlot['day'], enabled: boolean): void {
    this.availability = this.availability.map((slot) => slot.day === day ? { ...slot, enabled } : slot);
  }

  updateAvailabilityTime(day: ProviderAvailabilitySlot['day'], key: 'start' | 'end', value: string): void {
    this.availability = this.availability.map((slot) => slot.day === day ? { ...slot, [key]: value } : slot);
  }

  submitReschedule(): void {
    if (!this.rescheduleRequestId || !this.rescheduleDate || !this.rescheduleTime) {
      this.notify('Pick a job, date, and time before rescheduling.', 'error');
      return;
    }

    const iso = new Date(`${this.rescheduleDate}T${this.rescheduleTime}:00`).toISOString();
    this.workspace.setReschedule(this.rescheduleRequestId, iso);
    this.notify('Job rescheduled successfully.', 'success');

    this.reloadJobs();
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  dismissToast(): void {
    this.showToast = false;
  }

  formatTime(date: Date): string {
    return formatTimeChip(date);
  }

  private sameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    this.showToast = true;
  }
}
