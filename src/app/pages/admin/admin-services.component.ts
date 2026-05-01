import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { serviceCatalog } from '../../core/mock-data';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin-services.component.html'
})
export class AdminServicesComponent {
  services = serviceCatalog;
}
