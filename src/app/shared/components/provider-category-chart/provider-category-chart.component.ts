import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface CategoryBar {
  label: string;
  value: number;
}

@Component({
  selector: 'app-provider-category-chart',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './provider-category-chart.component.html'
})
export class ProviderCategoryChartComponent {
  @Input() bars: CategoryBar[] = [];
  @Input() title = 'Jobs by Service Category';
  @Input() emptyMessage = 'No jobs to chart.';

  get maxValue(): number {
    return Math.max(1, ...this.bars.map((bar) => bar.value));
  }

  widthPercent(value: number): number {
    return Math.max(6, Math.round((value / this.maxValue) * 100));
  }
}
