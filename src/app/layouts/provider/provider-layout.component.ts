import { Component, HostListener } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JobRecord, PlatformProvider, PlatformStoreService } from '../../core/platform-store.service';
import { ProviderWorkspaceStateService } from '../../core/provider-workspace-state.service';

interface ProviderNavItem {
  label: string;
  path: string;
  icon: string;
}

interface ProviderNotificationItem {
  id: string;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-provider-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, NgClass],
  templateUrl: './provider-layout.component.html'
})
export class ProviderLayoutComponent {
  mobileNavOpen = false;
  sidebarCollapsed = false;
  notificationsOpen = false;
  dismissedNotifications = new Set<string>();

  private provider: PlatformProvider | null = null;

  readonly navItems: ProviderNavItem[] = [
    { label: 'Dashboard', path: '/provider/dashboard', icon: 'DB' },
    { label: 'Requests', path: '/provider/requests', icon: 'RQ' },
    { label: 'Calendar', path: '/provider/calendar', icon: 'CL' },
    { label: 'Earnings', path: '/provider/earnings', icon: 'ER' },
    { label: 'Reviews', path: '/provider/reviews', icon: 'RV' },
    { label: 'Profile', path: '/provider/profile', icon: 'PF' }
  ];

  constructor(
    private readonly store: PlatformStoreService,
    private readonly workspace: ProviderWorkspaceStateService
  ) {
    this.provider = this.store.listProviders().find((provider) => provider.approvalStatus === 'ACTIVE') ?? this.store.listProviders()[0] ?? null;
  }

  get notifications(): ProviderNotificationItem[] {
    const jobs = this.provider ? this.store.listJobsForProvider(this.provider.id) : [];

    const newRequests = jobs.filter((job) => !job.assignedProviderId && ['PENDING', 'MATCHING', 'ASSIGNED'].includes(job.status)).length;
    const rescheduled = jobs.filter((job) => this.workspace.hasReschedule(job.requestId)).length;
    const deadlineJobs = this.upcomingJobs(jobs, 4).length;

    const computed: ProviderNotificationItem[] = [
      {
        id: 'new-requests',
        title: 'New requests',
        detail: `${newRequests} jobs are waiting for action.`
      },
      {
        id: 'schedule-updates',
        title: 'Schedule changes',
        detail: `${rescheduled} jobs were rescheduled by your team.`
      },
      {
        id: 'deadlines',
        title: 'Approaching deadlines',
        detail: `${deadlineJobs} jobs start within the next 4 hours.`
      }
    ];

    return computed.filter((notification) => !this.dismissedNotifications.has(notification.id));
  }

  get notificationCount(): number {
    return this.notifications.length;
  }

  get providerName(): string {
    return this.provider?.name ?? 'Provider Team';
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

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  dismissNotification(id: string): void {
    this.dismissedNotifications.add(id);
  }

  dismissAllNotifications(): void {
    this.notifications.forEach((notification) => this.dismissedNotifications.add(notification.id));
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
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
    }
  }

  private upcomingJobs(jobs: JobRecord[], withinHours: number): JobRecord[] {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setHours(horizon.getHours() + withinHours);

    return jobs.filter((job, index) => {
      const scheduled = this.workspace.scheduledAtFor(job, index);
      return scheduled >= now
        && scheduled <= horizon
        && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(job.status);
    });
  }
}
