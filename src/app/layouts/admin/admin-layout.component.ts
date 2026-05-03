import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  uiMessage = '';

  navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Requests', path: '/admin/requests' },
    { label: 'CRM', path: '/admin/crm' },
    { label: 'Services', path: '/admin/services' },
    { label: 'Employees', path: '/admin/employees' },
    { label: 'Providers', path: '/admin/providers' },
    { label: 'Invoicing', path: '/admin/invoicing' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Login', path: '/admin/login' }
  ];

  onOpenInsights(): void {
    this.setUiMessage('Opening operations insights (demo mode).');
  }

  onExport(): void {
    this.setUiMessage('Export queued. A demo file will be ready in a few seconds.');
  }

  clearUiMessage(): void {
    this.uiMessage = '';
  }

  private setUiMessage(message: string): void {
    this.uiMessage = message;
  }
}
