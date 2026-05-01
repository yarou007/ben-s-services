import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { adminRequests } from '../../core/mock-data';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './admin-requests.component.html'
})
export class AdminRequestsComponent {
  requests = adminRequests;

  statusClass(status: string): string {
    if (status === 'Assigned') {
      return 'pill pill-blue';
    }
    if (status === 'In Review') {
      return 'pill pill-orange';
    }
    if (status === 'Resolved') {
      return 'pill pill-ink';
    }
    return 'pill pill-ink';
  }
}
