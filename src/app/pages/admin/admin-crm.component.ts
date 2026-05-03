import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { crmCustomers } from '../../core/mock-data';

@Component({
  selector: 'app-admin-crm',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-crm.component.html'
})
export class AdminCrmComponent {
  customers = crmCustomers;
}
