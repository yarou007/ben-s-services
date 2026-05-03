import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface DetailField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './details-modal.component.html'
})
export class DetailsModalComponent {
  @Input() open = false;
  @Input() title = 'Details';
  @Input() subtitle = '';
  @Input() fields: DetailField[] = [];

  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}
