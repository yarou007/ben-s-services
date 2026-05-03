import { Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-widget',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule],
  templateUrl: './feedback-widget.component.html'
})
export class FeedbackWidgetComponent {
  @Input() title = 'Rate your portal experience';
  @Input() subtitle = 'Tell us what is working and what we should improve.';
  @Input() compact = false;

  rating = 0;
  message = '';
  submitted = false;

  readonly stars = [1, 2, 3, 4, 5];

  setRating(star: number): void {
    this.rating = star;
  }

  submit(): void {
    if (!this.rating) {
      return;
    }

    this.submitted = true;
  }

  reset(): void {
    this.rating = 0;
    this.message = '';
    this.submitted = false;
  }
}
