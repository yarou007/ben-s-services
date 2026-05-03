import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-toast-message',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './toast-message.component.html'
})
export class ToastMessageComponent {
  @Input() show = false;
  @Input() message = '';
  @Input() tone: 'success' | 'error' | 'info' = 'info';

  @Output() dismiss = new EventEmitter<void>();

  get toneClass(): string {
    if (this.tone === 'success') {
      return 'border-emerald-300 bg-emerald-50 text-emerald-900';
    }
    if (this.tone === 'error') {
      return 'border-rose-300 bg-rose-50 text-rose-900';
    }
    return 'border-brand-300 bg-brand-50 text-brand-900';
  }
}
