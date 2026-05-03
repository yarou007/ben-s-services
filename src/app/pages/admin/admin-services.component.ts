import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { serviceCatalog } from '../../core/mock-data';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-services.component.html'
})
export class AdminServicesComponent {
  services = serviceCatalog;
}
