import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
  @Input() kicker = '';
  @Input() title = '';
  @Input() subtitle = '';
}
