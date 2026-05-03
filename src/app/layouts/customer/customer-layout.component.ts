import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

interface CustomerNavItem {
  label: string;
  path: string;
  icon: string;
  fragment?: string;
}

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  templateUrl: './customer-layout.component.html'
})
export class CustomerLayoutComponent {
  mobileNavOpen = false;

  navItems: CustomerNavItem[] = [
    { label: 'Dashboard', path: '/customer/home', icon: 'DB' },
    { label: 'Submit Request', path: '/customer/service-request', icon: 'SR' },
    { label: 'My Requests', path: '/customer/track-request', icon: 'MR' },
    { label: 'Knowledge Base', path: '/customer/help', icon: 'KB' },
    { label: 'Profile', path: '/customer/home', icon: 'PF', fragment: 'profile-section' }
  ];

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024 && this.mobileNavOpen) {
      this.mobileNavOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.mobileNavOpen = false;
    }
  }
}
