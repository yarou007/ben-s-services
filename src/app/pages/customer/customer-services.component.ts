import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { customerServiceAreas, customerServiceCategories } from '../../core/mock-data';

@Component({
  selector: 'app-customer-services',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './customer-services.component.html'
})
export class CustomerServicesComponent {
  categories = customerServiceCategories;
  areas = customerServiceAreas;
}
