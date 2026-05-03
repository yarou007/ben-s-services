import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';

interface AdminNavItem {
  label: string;
  path: string;
  section: 'Overview' | 'Operations' | 'Management' | 'System';
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, NgClass],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  uiMessage = '';
  mobileNavOpen = false;
  sidebarCollapsed = false;

  navItems: AdminNavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', section: 'Overview', icon: 'DB' },
    { label: 'Requests', path: '/admin/requests', section: 'Operations', icon: 'RQ' },
    { label: 'CRM', path: '/admin/crm', section: 'Operations', icon: 'CM' },
    { label: 'Services', path: '/admin/services', section: 'Operations', icon: 'SV' },
    { label: 'Employees', path: '/admin/employees', section: 'Management', icon: 'EM' },
    { label: 'Providers', path: '/admin/providers', section: 'Management', icon: 'PR' },
    { label: 'Invoicing', path: '/admin/invoicing', section: 'Management', icon: 'IV' },
    { label: 'Reports', path: '/admin/reports', section: 'Management', icon: 'RP' },
    { label: 'Login', path: '/admin/login', section: 'System', icon: 'LG' }
  ];

  navSections: AdminNavItem['section'][] = ['Overview', 'Operations', 'Management', 'System'];

  onOpenInsights(): void {
    this.setUiMessage('Opening operations insights (demo mode).');
  }

  onExport(): void {
    this.setUiMessage('Export queued. A demo file will be ready in a few seconds.');
  }

  clearUiMessage(): void {
    this.uiMessage = '';
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

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
    if (window.innerWidth < 1280 && this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.mobileNavOpen = false;
    }
  }

  navItemsBySection(section: AdminNavItem['section']): AdminNavItem[] {
    return this.navItems.filter((item) => item.section === section);
  }

  private setUiMessage(message: string): void {
    this.uiMessage = message;
  }
}
