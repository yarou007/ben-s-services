import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-provider-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './provider-layout.component.html'
})
export class ProviderLayoutComponent {
  navItems = [
    { label: 'Dashboard', path: '/provider/dashboard' },
    { label: 'Profile', path: '/provider/profile' },
    { label: 'Register', path: '/provider/register' }
  ];
}
