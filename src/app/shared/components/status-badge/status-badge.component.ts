import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status-badge.component.html'
})
export class StatusBadgeComponent {
  @Input() status = 'PENDING';

  get label(): string {
    return this.status.replace(/_/g, ' ');
  }

  get toneClass(): string {
    const normalized = this.status.toUpperCase();
    const tones: Record<string, string> = {
      PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
      MATCHING: 'bg-blue-100 text-blue-700 border-blue-200',
      ASSIGNED: 'bg-violet-100 text-violet-700 border-violet-200',
      ACCEPTED_BY_PROVIDER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      ON_THE_WAY: 'bg-orange-100 text-orange-700 border-orange-200',
      IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
      ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-700 border-orange-200',
      PAUSED: 'bg-amber-100 text-amber-700 border-amber-200',
      OFFLINE: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    return tones[normalized] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
