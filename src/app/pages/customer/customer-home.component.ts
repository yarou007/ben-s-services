import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { customerBadges, customerPromotions, customerTimeline, featuredServices } from '../../core/mock-data';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './customer-home.component.html'
})
export class CustomerHomeComponent {
  timeline = customerTimeline;
  badges = customerBadges;
  services = featuredServices;
  promotions = customerPromotions;
}
