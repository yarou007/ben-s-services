import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass],
  templateUrl: './role-selector.component.html'
})
export class RoleSelectorComponent {
  roles = [
    {
      title: 'Admin',
      description: 'Oversee service requests, providers, and performance signals.',
      path: '/admin/dashboard',
      pill: 'pill-blue'
    },
    {
      title: 'Customer',
      description: 'Submit and track service requests with real-time updates.',
      path: '/customer/home',
      pill: 'pill-orange'
    },
    {
      title: 'Provider',
      description: 'Manage jobs, schedules, and operational readiness.',
      path: '/provider/dashboard',
      pill: 'pill-ink'
    }
  ];
}
