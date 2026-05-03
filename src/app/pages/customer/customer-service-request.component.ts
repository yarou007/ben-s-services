import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  PlatformStoreService,
  RequestUrgency
} from '../../core/platform-store.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface RequestFormModel {
  serviceType: string;
  description: string;
  urgency: RequestUrgency;
  location: string;
  city: string;
  zip: string;
}

@Component({
  selector: 'app-customer-service-request',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './customer-service-request.component.html'
})
export class CustomerServiceRequestComponent {
  customer = {
    name: '',
    email: '',
    phone: ''
  };

  model: RequestFormModel = {
    serviceType: 'Locksmith',
    description: '',
    urgency: 'High',
    location: '',
    city: '',
    zip: ''
  };

  submitting = false;
  submittedRequestId = '';
  errorMessage = '';

  constructor(private readonly store: PlatformStoreService) {
    this.customer = this.store.getCustomerContext();
  }

  submit(): void {
    this.errorMessage = '';

    if (!this.model.description || !this.model.location || !this.model.city || !this.model.zip) {
      this.errorMessage = 'Please complete all required fields before submitting.';
      return;
    }

    this.submitting = true;

    const created = this.store.createCustomerRequest({
      serviceType: this.model.serviceType,
      description: this.model.description,
      urgency: this.model.urgency,
      location: this.model.location,
      city: this.model.city,
      zip: this.model.zip,
      customerName: this.customer.name,
      customerEmail: this.customer.email,
      customerPhone: this.customer.phone
    });

    this.submitting = false;
    this.submittedRequestId = created.id;
  }

  resetForm(): void {
    this.submittedRequestId = '';
    this.model = {
      serviceType: 'Locksmith',
      description: '',
      urgency: 'High',
      location: '',
      city: '',
      zip: ''
    };
  }

  get urgencyStatus(): string {
    if (this.model.urgency === 'Emergency') {
      return 'MATCHING';
    }
    if (this.model.urgency === 'High') {
      return 'PENDING';
    }
    return 'PENDING';
  }
}
