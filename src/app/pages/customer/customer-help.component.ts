import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { customerFaqs } from '../../core/mock-data';

@Component({
  selector: 'app-customer-help',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './customer-help.component.html'
})
export class CustomerHelpComponent {
  faqs = customerFaqs;
}
