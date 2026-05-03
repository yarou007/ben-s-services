import { Component } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { customerTimeline } from '../../core/mock-data';

@Component({
  selector: 'app-customer-track-request',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, RouterLink],
  templateUrl: './customer-track-request.component.html'
})
export class CustomerTrackRequestComponent {
  timeline = customerTimeline;
  steps = [
    { label: 'Submitted', active: true },
    { label: 'Assigned', active: true },
    { label: 'In Progress', active: false },
    { label: 'Completed', active: false }
  ];
}
