import { Component, Input } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';

export interface EarningsPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-provider-earnings-chart',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe],
  templateUrl: './provider-earnings-chart.component.html'
})
export class ProviderEarningsChartComponent {
  @Input() points: EarningsPoint[] = [];
  @Input() title = 'Earnings Over Time';
  @Input() emptyMessage = 'No earnings data available for the selected filters.';

  readonly chartHeight = 190;
  readonly chartWidth = 640;
  readonly chartPadding = 28;

  get maxValue(): number {
    return Math.max(1, ...this.points.map((point) => point.value));
  }

  get polyline(): string {
    if (!this.points.length) {
      return '';
    }

    if (this.points.length === 1) {
      return `${this.chartPadding},${this.pointY(this.points[0].value)} ${this.chartWidth - this.chartPadding},${this.pointY(this.points[0].value)}`;
    }

    const step = (this.chartWidth - this.chartPadding * 2) / (this.points.length - 1);
    return this.points
      .map((point, index) => `${this.chartPadding + (step * index)},${this.pointY(point.value)}`)
      .join(' ');
  }

  pointX(index: number): number {
    if (this.points.length <= 1) {
      return this.chartPadding;
    }

    const step = (this.chartWidth - this.chartPadding * 2) / (this.points.length - 1);
    return this.chartPadding + (step * index);
  }

  pointY(value: number): number {
    const drawableHeight = this.chartHeight - this.chartPadding * 2;
    const ratio = value / this.maxValue;
    return this.chartHeight - this.chartPadding - (ratio * drawableHeight);
  }

  yTicks(): number[] {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(this.maxValue * ratio));
  }
}
