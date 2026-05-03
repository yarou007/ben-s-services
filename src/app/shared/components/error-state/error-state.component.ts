import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  templateUrl: './error-state.component.html'
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() description = 'Please try again.';
  @Input() retryLabel = 'Retry';

  @Output() retry = new EventEmitter<void>();
}
