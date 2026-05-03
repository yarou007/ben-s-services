import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { crmContactLog, crmContracts, crmSites, crmCustomers } from '../../core/mock-data';

@Component({
  selector: 'app-admin-crm-detail',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-crm-detail.component.html'
})
export class AdminCrmDetailComponent {
  account = crmCustomers[0];
  contracts = crmContracts;
  sites = crmSites;
  contacts = crmContactLog;
}
