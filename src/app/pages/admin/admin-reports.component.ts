import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { reportTemplates } from '../../core/mock-data';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-reports.component.html'
})
export class AdminReportsComponent {
  reports = reportTemplates;
  uiMessage = '';

  trigger(action: string, name?: string): void {
    this.uiMessage = name
      ? `${action} for ${name} is currently a UI placeholder in demo mode.`
      : `${action} is currently a UI placeholder in demo mode.`;
  }

  dismissMessage(): void {
    this.uiMessage = '';
  }
}
