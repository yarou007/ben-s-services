import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { customerFaqs } from '../../core/mock-data';

@Component({
  selector: 'app-customer-help',
  standalone: true,
  imports: [NgFor],
  templateUrl: './customer-help.component.html'
})
export class CustomerHelpComponent {
  faqs = customerFaqs;
}
