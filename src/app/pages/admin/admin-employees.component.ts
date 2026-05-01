import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { employees } from '../../core/mock-data';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin-employees.component.html'
})
export class AdminEmployeesComponent {
  team = employees;
}
