import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { reportTemplates } from '../../core/mock-data';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin-reports.component.html'
})
export class AdminReportsComponent {
  reports = reportTemplates;
}
