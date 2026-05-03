import { Injectable } from '@angular/core';
import { adminRequests, providerJobs, providers } from './mock-data';

export type RequestStatus =
  | 'PENDING'
  | 'MATCHING'
  | 'ASSIGNED'
  | 'ACCEPTED_BY_PROVIDER'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type RequestUrgency = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface PlatformProvider {
  id: string;
  name: string;
  services: string[];
  serviceArea: string;
  approvalStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'PAUSED';
  availability: 'Available' | 'Busy' | 'Offline';
  rating: number;
  responseTime: string;
  jobsCompleted: number;
}

export interface PlatformRequest {
  id: string;
  serviceType: string;
  title: string;
  status: RequestStatus;
  urgency: RequestUrgency;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  city: string;
  zip: string;
  assignedProviderId: string | null;
  createdAt: string;
  updatedAt: string;
  source: 'admin' | 'customer';
  notes: string;
}

export interface JobRecord {
  id: string;
  requestId: string;
  serviceType: string;
  title: string;
  status: RequestStatus;
  urgency: RequestUrgency;
  location: string;
  city: string;
  customerName: string;
  assignedProviderId: string | null;
  createdAt: string;
}

export interface CreateCustomerRequestPayload {
  serviceType: string;
  description: string;
  urgency: RequestUrgency;
  location: string;
  city: string;
  zip: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformStoreService {
  private readonly customerContext = {
    name: 'Avery Cole',
    email: 'avery.cole@example.com',
    phone: '(917) 555-0148'
  };

  private requests: PlatformRequest[] = [];
  private providers: PlatformProvider[] = [];

  constructor() {
    this.providers = this.seedProviders();
    this.requests = this.seedRequests();
  }

  getCustomerContext(): { name: string; email: string; phone: string } {
    return { ...this.customerContext };
  }

  listRequests(): PlatformRequest[] {
    return this.requests.map((request) => ({ ...request }));
  }

  listCustomerRequests(customerName = this.customerContext.name): PlatformRequest[] {
    return this.requests
      .filter((request) => request.customerName.toLowerCase() === customerName.toLowerCase())
      .map((request) => ({ ...request }));
  }

  listProviders(): PlatformProvider[] {
    return this.providers.map((provider) => ({ ...provider }));
  }

  getRequestById(requestId: string): PlatformRequest | undefined {
    const request = this.requests.find((item) => item.id === requestId);
    return request ? { ...request } : undefined;
  }

  createCustomerRequest(payload: CreateCustomerRequestPayload): PlatformRequest {
    const id = this.generateRequestId();
    const now = this.timestamp();

    const request: PlatformRequest = {
      id,
      title: payload.description,
      serviceType: payload.serviceType,
      status: payload.urgency === 'Emergency' ? 'MATCHING' : 'PENDING',
      urgency: payload.urgency,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      location: payload.location,
      city: payload.city,
      zip: payload.zip,
      assignedProviderId: null,
      createdAt: now,
      updatedAt: now,
      source: 'customer',
      notes: 'Created from customer workspace.'
    };

    this.requests = [request, ...this.requests];
    return { ...request };
  }

  updateRequestStatus(requestId: string, nextStatus: RequestStatus): PlatformRequest | null {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return null;
    }

    request.status = nextStatus;
    request.updatedAt = this.timestamp();

    if (nextStatus === 'CANCELLED' || nextStatus === 'REJECTED') {
      request.assignedProviderId = null;
    }

    if (nextStatus === 'COMPLETED') {
      const provider = this.providers.find((item) => item.id === request.assignedProviderId);
      if (provider) {
        provider.jobsCompleted += 1;
      }
    }

    return { ...request };
  }

  updateRequestDetails(
    requestId: string,
    patch: Partial<Pick<PlatformRequest, 'title' | 'location' | 'city' | 'zip' | 'notes'>>
  ): PlatformRequest | null {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return null;
    }

    if (patch.title !== undefined) {
      request.title = patch.title;
    }
    if (patch.location !== undefined) {
      request.location = patch.location;
    }
    if (patch.city !== undefined) {
      request.city = patch.city;
    }
    if (patch.zip !== undefined) {
      request.zip = patch.zip;
    }
    if (patch.notes !== undefined) {
      request.notes = patch.notes;
    }

    request.updatedAt = this.timestamp();
    return { ...request };
  }

  assignProvider(requestId: string, providerId: string): PlatformRequest | null {
    const request = this.requests.find((item) => item.id === requestId);
    const provider = this.providers.find((item) => item.id === providerId);

    if (!request || !provider) {
      return null;
    }

    request.assignedProviderId = provider.id;
    request.status = 'ASSIGNED';
    request.updatedAt = this.timestamp();
    return { ...request };
  }

  approveProvider(providerId: string): PlatformProvider | null {
    const provider = this.providers.find((item) => item.id === providerId);
    if (!provider) {
      return null;
    }

    provider.approvalStatus = 'ACTIVE';
    provider.availability = 'Available';
    return { ...provider };
  }

  rejectProvider(providerId: string): PlatformProvider | null {
    const provider = this.providers.find((item) => item.id === providerId);
    if (!provider) {
      return null;
    }

    provider.approvalStatus = 'REJECTED';
    provider.availability = 'Offline';
    return { ...provider };
  }

  listJobsForProvider(providerId: string): JobRecord[] {
    return this.requests
      .filter((request) => {
        if (request.assignedProviderId === providerId) {
          return true;
        }

        const isAvailableQueue = request.assignedProviderId === null && ['PENDING', 'MATCHING'].includes(request.status);
        return isAvailableQueue;
      })
      .map((request) => ({
        id: request.id.replace('REQ', 'JOB'),
        requestId: request.id,
        serviceType: request.serviceType,
        title: request.title,
        status: request.status,
        urgency: request.urgency,
        location: request.location,
        city: request.city,
        customerName: request.customerName,
        assignedProviderId: request.assignedProviderId,
        createdAt: request.createdAt
      }));
  }

  acceptJob(providerId: string, requestId: string): PlatformRequest | null {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return null;
    }

    request.assignedProviderId = providerId;
    request.status = 'ACCEPTED_BY_PROVIDER';
    request.updatedAt = this.timestamp();
    return { ...request };
  }

  declineJob(providerId: string, requestId: string): PlatformRequest | null {
    const request = this.requests.find((item) => item.id === requestId);
    if (!request) {
      return null;
    }

    if (request.assignedProviderId === providerId) {
      request.assignedProviderId = null;
      request.status = 'MATCHING';
      request.updatedAt = this.timestamp();
    }

    return { ...request };
  }

  private seedProviders(): PlatformProvider[] {
    return providers.map((provider, index) => {
      const normalizedName = provider.name.toLowerCase();
      const providerId = this.providerId(index + 1);
      const services = normalizedName.includes('glass')
        ? ['Glass Repair']
        : ['Locksmith'];

      return {
        id: providerId,
        name: provider.name,
        services,
        serviceArea: provider.coverage,
        approvalStatus: provider.status === 'Active' ? 'ACTIVE' : 'PAUSED',
        availability: provider.status === 'Active' ? 'Available' : 'Offline',
        rating: Number(provider.rating),
        responseTime: provider.responseTime,
        jobsCompleted: Number(provider.jobsCompleted)
      };
    });
  }

  private seedRequests(): PlatformRequest[] {
    const mapped = adminRequests.map((request, index) => {
      const mappedProviderId = this.providerId((index % this.providers.length) + 1);
      const assignedProviderId = request.status === 'Assigned' || request.status === 'Resolved'
        ? mappedProviderId
        : null;

      const city = this.extractCity(request.location ?? 'Unknown');
      const status = this.toRequestStatus(request.status);

      return {
        id: request.id,
        title: request.title,
        serviceType: request.category,
        status,
        urgency: request.priority ?? 'Medium',
        customerName: request.customer ?? 'Unknown Customer',
        customerEmail: this.toEmail(request.customer ?? `customer-${index + 1}`),
        customerPhone: this.toPhone(index + 1),
        location: request.location ?? 'N/A',
        city,
        zip: this.toZip(index),
        assignedProviderId,
        createdAt: request.createdAt ?? this.timestamp(),
        updatedAt: request.createdAt ?? this.timestamp(),
        source: 'admin' as const,
        notes: `SLA target ${request.sla}. ${request.owner} currently monitoring this request.`
      } satisfies PlatformRequest;
    });

    const seededJobs = providerJobs.map((job, index) => ({
      id: job.id.replace('JOB', 'REQ'),
      title: job.title,
      serviceType: job.title.toLowerCase().includes('glass') ? 'Glass Repair' : 'Locksmith',
      status: this.fromProviderJobStatus(job.status),
      urgency: job.title.toLowerCase().includes('emergency') ? ('Emergency' as RequestUrgency) : ('High' as RequestUrgency),
      customerName: job.customer,
      customerEmail: this.toEmail(job.customer),
      customerPhone: this.toPhone(index + 5),
      location: job.location,
      city: this.extractCity(job.location),
      zip: this.toZip(index + 5),
      assignedProviderId: job.status === 'Pending' ? null : this.providerId(1),
      createdAt: 'Today',
      updatedAt: 'Today',
      source: 'admin' as const,
      notes: `Imported from provider queue (${job.distance}, ETA ${job.eta}).`
    }));

    const customerRequest: PlatformRequest = {
      id: 'REQ-3200',
      title: 'Broken apartment front door lock',
      serviceType: 'Locksmith',
      status: 'ON_THE_WAY',
      urgency: 'Emergency',
      customerName: this.customerContext.name,
      customerEmail: this.customerContext.email,
      customerPhone: this.customerContext.phone,
      location: '34 Bayard St, Brooklyn, NY',
      city: 'Brooklyn',
      zip: '11211',
      assignedProviderId: this.providerId(1),
      createdAt: 'Today 10:12 AM',
      updatedAt: 'Today 10:40 AM',
      source: 'customer',
      notes: 'Customer requested emergency callback before arrival.'
    };

    return [customerRequest, ...mapped, ...seededJobs];
  }

  private toRequestStatus(status: string): RequestStatus {
    if (status === 'Open') {
      return 'PENDING';
    }
    if (status === 'In Review') {
      return 'MATCHING';
    }
    if (status === 'Assigned') {
      return 'ASSIGNED';
    }
    return 'COMPLETED';
  }

  private fromProviderJobStatus(status: string): RequestStatus {
    if (status === 'Pending') {
      return 'PENDING';
    }
    if (status === 'Accepted') {
      return 'ACCEPTED_BY_PROVIDER';
    }
    return 'COMPLETED';
  }

  private extractCity(location: string): string {
    const parts = location.split(',').map((part) => part.trim());
    if (parts.length > 1) {
      return parts[1];
    }
    return location;
  }

  private providerId(id: number): string {
    return `PROV-${id.toString().padStart(3, '0')}`;
  }

  private generateRequestId(): string {
    const numericIds = this.requests
      .map((request) => Number(request.id.replace(/[^0-9]/g, '')))
      .filter((value) => Number.isFinite(value));

    const next = Math.max(3200, ...numericIds) + 1;
    return `REQ-${next}`;
  }

  private timestamp(): string {
    return new Date().toLocaleString();
  }

  private toEmail(name: string): string {
    const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    return `${safe || 'customer'}@example.com`;
  }

  private toPhone(seed: number): string {
    const suffix = (1000 + seed).toString().slice(-4);
    return `(917) 555-${suffix}`;
  }

  private toZip(seed: number): string {
    return (10000 + seed * 7).toString().slice(-5);
  }
}
