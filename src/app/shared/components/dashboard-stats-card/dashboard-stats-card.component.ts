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
  @Input() comparison = '';
  @Input() interactive = false;
  @Input() active = false;

  @Output() cardClick = new EventEmitter<void>();

  get trendClass(): string {
    if (this.trend === 'up') {
      return 'text-emerald-700';
    }
    if (this.trend === 'down') {
      return 'text-rose-700';
    }
    return 'text-slate-600';
  }

  get trendLabel(): string {
    if (this.trend === 'up') {
      return 'Up';
    }
    if (this.trend === 'down') {
      return 'Down';
    }
    return 'Steady';
  }

  get trendIcon(): string {
    if (this.trend === 'up') {
      return '▲';
    }
    if (this.trend === 'down') {
      return '▼';
    }
    return '●';
  }
}
