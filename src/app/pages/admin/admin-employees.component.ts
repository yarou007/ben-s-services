import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { employees } from '../../core/mock-data';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-employees.component.html'
})
export class AdminEmployeesComponent {
  team = employees;
}
