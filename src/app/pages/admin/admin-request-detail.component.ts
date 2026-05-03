import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { adminRequests, dispatchProviders, dispatchSteps, requestActivity } from '../../core/mock-data';

@Component({
  selector: 'app-admin-request-detail',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, RouterLink],
  templateUrl: './admin-request-detail.component.html'
})
export class AdminRequestDetailComponent {
  request = adminRequests[0];
  steps = dispatchSteps;
  providers = dispatchProviders;
  activity = requestActivity;
  uiMessage = '';

  stepClass(status: string): string {
    if (status === 'done') {
      return 'border-emerald-500 bg-emerald-100 text-emerald-600';
    }
    if (status === 'active') {
      return 'border-brand-500 bg-brand-100 text-brand-700';
    }
    return 'border-slate-200 bg-slate-100 text-slate-400';
  }

  trigger(action: string, target?: string): void {
    this.uiMessage = target
      ? `${action} for ${target} is demo-only in this MVP.`
      : `${action} is demo-only in this MVP.`;
  }

  dismissMessage(): void {
    this.uiMessage = '';
  }
}
