import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import {
  AdminHighlight,
  RegionStat,
  ReportTemplate,
  RequestItem,
  ServiceCatalogItem,
  StatCard,
  adminHighlights,
  adminRequests,
  adminStats,
  regionStats,
  reportTemplates,
  serviceCatalog
} from '../../core/mock-data';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  stats: StatCard[] = [...adminStats];
  requests: RequestItem[] = [...adminRequests];
  highlights: AdminHighlight[] = [...adminHighlights];
  regions: RegionStat[] = [...regionStats];
  services: ServiceCatalogItem[] = [...serviceCatalog];
  reports: ReportTemplate[] = [...reportTemplates];
  feedback = '';
  showAllRequests = false;

  get visibleRequests(): RequestItem[] {
    return this.showAllRequests ? this.requests : this.requests.slice(0, 2);
  }

  trendClass(trend: string): string {
    if (trend === 'up') {
      return 'text-emerald-600';
    }
    if (trend === 'down') {
      return 'text-rose-600';
    }
    return 'text-slate-500';
  }

  toggleRequestsView(): void {
    this.showAllRequests = !this.showAllRequests;
    this.feedback = this.showAllRequests
      ? 'Showing all priority requests.'
      : 'Showing top priority requests.';
  }

  exportRegionalReport(): void {
    this.feedback = 'Regional performance export started (demo mode).';
  }

  addService(): void {
    this.services = [
      {
        name: `Emergency Boarding #${this.services.length + 1}`,
        type: 'Glass Repair',
        responseTarget: '2 hours',
        compliance: 'Pilot coverage'
      },
      ...this.services
    ];
    this.feedback = 'A demo service was added to the catalog.';
  }

  generateReportTemplate(): void {
    this.reports = [
      {
        name: `Field Performance Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        cadence: 'On demand',
        format: 'PDF'
      },
      ...this.reports
    ];
    this.feedback = 'New report template generated for demo.';
  }

  runReport(report: ReportTemplate): void {
    this.feedback = `${report.name} is running now (demo).`;
  }

  exportReport(report: ReportTemplate): void {
    this.feedback = `${report.name} export queued (demo).`;
  }
}
