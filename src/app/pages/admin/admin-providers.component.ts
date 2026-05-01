import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { providers } from '../../core/mock-data';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin-providers.component.html'
})
export class AdminProvidersComponent {
  providers = providers;
}
