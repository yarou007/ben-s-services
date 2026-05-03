import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  @Input() title = 'Nothing to show yet';
  @Input() description = '';
  @Input() ctaLabel = '';
  @Input() ctaLink = '';
}
