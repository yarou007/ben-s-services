import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  email = '';
  password = '';

  touched = {
    email: false,
    password: false
  };

  submitting = false;
  formMessage = '';
  formMessageTone: 'error' | 'success' | '' = '';

  get emailInvalid(): boolean {
    return this.touched.email && !this.isEmailValid(this.email);
  }

  get passwordInvalid(): boolean {
    return this.touched.password && this.password.trim().length < 6;
  }

  onBlur(field: 'email' | 'password'): void {
    this.touched[field] = true;
  }

  submit(): void {
    this.touched.email = true;
    this.touched.password = true;

    if (!this.isEmailValid(this.email) || this.password.trim().length < 6) {
      this.formMessage = 'Please enter a valid email and a password with at least 6 characters.';
      this.formMessageTone = 'error';
      return;
    }

    this.submitting = true;
    this.formMessage = '';
    this.formMessageTone = '';

    setTimeout(() => {
      this.submitting = false;
      this.formMessage = 'Mock sign-in complete. Workspace access is demo-only in this version.';
      this.formMessageTone = 'success';
    }, 900);
  }

  private isEmailValid(value: string): boolean {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
  }
}
