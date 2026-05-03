import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';

export interface DetailField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './details-modal.component.html'
})
export class DetailsModalComponent {
  @Input() open = false;
  @Input() title = 'Details';
  @Input() subtitle = '';
  @Input() fields: DetailField[] = [];

  @Output() close = new EventEmitter<void>();

  get profileInitials(): string {
    return this.title
      .split(/\s+/)
      .filter((part) => part.trim().length > 0)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'ID';
  }

  get normalizedFields(): DetailField[] {
    return this.fields.filter((field) => field.label.trim() && field.value.trim());
  }

  get spotlightFields(): DetailField[] {
    const priority = this.normalizedFields.filter((field) => this.isSpotlightField(field.label));
    return priority.slice(0, 3);
  }

  get detailFields(): DetailField[] {
    const spotlightSet = new Set(this.spotlightFields.map((field) => field.label.toLowerCase()));
    return this.normalizedFields.filter((field) => !spotlightSet.has(field.label.toLowerCase()));
  }

  fieldToneClass(label: string): string {
    const normalized = label.toLowerCase();
    if (normalized.includes('status') || normalized.includes('approval')) {
      return 'app-detail-value-status';
    }
    if (normalized.includes('rating') || normalized.includes('count') || normalized.includes('jobs')) {
      return 'app-detail-value-highlight';
    }
    return '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }

  private isSpotlightField(label: string): boolean {
    const normalized = label.toLowerCase();
    return (
      normalized.includes('status') ||
      normalized.includes('approval') ||
      normalized.includes('availability') ||
      normalized.includes('rating') ||
      normalized.includes('count') ||
      normalized.includes('jobs')
    );
  }
}
