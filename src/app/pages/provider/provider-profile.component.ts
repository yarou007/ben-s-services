import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  ProviderAvailabilitySlot,
  ProviderWorkspaceStateService
} from '../../core/provider-workspace-state.service';
import { ToastMessageComponent } from '../../shared/components/toast-message/toast-message.component';

interface ServiceOffering {
  name: string;
  enabled: boolean;
  price: string;
}

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [NgFor, ToastMessageComponent],
  templateUrl: './provider-profile.component.html'
})
export class ProviderProfileComponent {
  fullName = 'Metro Locksmith Co.';
  email = 'support@metrolocksmith.com';
  phone = '(212) 555-7812';
  serviceArea = 'Brooklyn, Manhattan, Jersey City';
  experience = '8 years';
  about = 'Licensed locksmith and glass repair team with same-day support.';

  availabilitySlots: ProviderAvailabilitySlot[] = [];
  offerings: ServiceOffering[] = [
    { name: 'Emergency lockout', enabled: true, price: '180' },
    { name: 'Lock replacement', enabled: true, price: '220' },
    { name: 'Storefront glass repair', enabled: true, price: '320' },
    { name: 'Commercial door service', enabled: false, price: '260' }
  ];

  showToast = false;
  toastTone: 'success' | 'error' | 'info' = 'success';
  toastMessage = '';

  constructor(private readonly workspace: ProviderWorkspaceStateService) {
    this.availabilitySlots = this.workspace.listAvailability();
  }

  toggleOffering(name: string, enabled: boolean): void {
    this.offerings = this.offerings.map((offering) => offering.name === name ? { ...offering, enabled } : offering);
  }

  updateOfferingPrice(name: string, price: string): void {
    this.offerings = this.offerings.map((offering) => offering.name === name ? { ...offering, price } : offering);
  }

  updateAvailability(day: ProviderAvailabilitySlot['day'], key: 'start' | 'end', value: string): void {
    this.availabilitySlots = this.availabilitySlots.map((slot) => slot.day === day ? { ...slot, [key]: value } : slot);
  }

  toggleAvailability(day: ProviderAvailabilitySlot['day'], enabled: boolean): void {
    this.availabilitySlots = this.availabilitySlots.map((slot) => slot.day === day ? { ...slot, enabled } : slot);
  }

  saveProfile(): void {
    this.workspace.updateAvailability(this.availabilitySlots);
    this.notify('Profile updates saved for this workspace session.', 'success');
  }

  dismissToast(): void {
    this.showToast = false;
  }

  private notify(message: string, tone: 'success' | 'error' | 'info'): void {
    this.toastTone = tone;
    this.toastMessage = message;
    this.showToast = true;
  }
}
