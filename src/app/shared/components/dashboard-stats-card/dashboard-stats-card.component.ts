import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard-stats-card',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './dashboard-stats-card.component.html'
})
export class DashboardStatsCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() note = '';
  @Input() trend: 'up' | 'down' | 'steady' | '' = '';
  @Input() interactive = false;
  @Input() active = false;

  @Output() cardClick = new EventEmitter<void>();

  get trendClass(): string {
    if (this.trend === 'up') {
      return 'text-emerald-600';
    }
    if (this.trend === 'down') {
      return 'text-rose-600';
    }
    return 'text-slate-500';
  }
}
