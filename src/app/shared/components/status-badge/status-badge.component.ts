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
      PENDING: 'bg-slate-100 text-slate-800 border-slate-300',
      MATCHING: 'bg-blue-100 text-blue-800 border-blue-300',
      ASSIGNED: 'bg-violet-100 text-violet-800 border-violet-300',
      ACCEPTED_BY_PROVIDER: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      ON_THE_WAY: 'bg-orange-100 text-orange-800 border-orange-300',
      IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-300',
      COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      PENDING_APPROVAL: 'bg-orange-100 text-orange-800 border-orange-300',
      PAUSED: 'bg-amber-100 text-amber-800 border-amber-300',
      OFFLINE: 'bg-slate-100 text-slate-800 border-slate-300'
    };

    return tones[normalized] ?? 'bg-slate-100 text-slate-800 border-slate-300';
  }
}
