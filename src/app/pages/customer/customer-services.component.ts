import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { customerServiceAreas, customerServiceCategories } from '../../core/mock-data';

@Component({
  selector: 'app-customer-services',
  standalone: true,
  imports: [NgFor],
  templateUrl: './customer-services.component.html'
})
export class CustomerServicesComponent {
  categories = customerServiceCategories;
  areas = customerServiceAreas;
}
