import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [NgFor],
  templateUrl: './pagination-controls.component.html'
})
export class PaginationControlsComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get canPrevious(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return this.page < this.totalPages;
  }

  previous(): void {
    if (this.canPrevious) {
      this.pageChange.emit(this.page - 1);
    }
  }

  next(): void {
    if (this.canNext) {
      this.pageChange.emit(this.page + 1);
    }
  }

  onPageSizeChange(value: string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.pageSizeChange.emit(parsed);
    }
  }
}
