import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { invoices } from '../../core/mock-data';

@Component({
  selector: 'app-admin-invoicing',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './admin-invoicing.component.html'
})
export class AdminInvoicingComponent {
  invoices = invoices;
  uiMessage = '';

  statusClass(status: string): string {
    if (status === 'Paid') {
      return 'pill pill-blue';
    }
    if (status === 'Overdue') {
      return 'pill pill-orange';
    }
    return 'pill pill-ink';
  }

  trigger(action: string): void {
    this.uiMessage = `${action} is currently a UI placeholder in demo mode.`;
  }

  dismissMessage(): void {
    this.uiMessage = '';
  }
}
