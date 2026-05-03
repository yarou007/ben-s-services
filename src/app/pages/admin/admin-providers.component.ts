import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { providers } from '../../core/mock-data';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-providers.component.html'
})
export class AdminProvidersComponent {
  providers = providers;
}
