import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './customer-layout.component.html'
})
export class CustomerLayoutComponent {
  navItems = [
    { label: 'Home', path: '/customer/home' },
    { label: 'Services', path: '/customer/services' },
    { label: 'Request Service', path: '/customer/service-request' },
    { label: 'Track Request', path: '/customer/track-request' },
    { label: 'Help', path: '/customer/help' }
  ];
}
