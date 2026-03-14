import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Layers, Info } from 'lucide-angular';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styles: [
    `
      :host {
        display: block;
      }
      .animate-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class LoginComponent {
  readonly Layers = Layers;
  readonly Info = Info;

  identifier = '';
  password = '';
  slug = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  clearError(): void {
    if (this.error) {
      this.error = '';
    }
  }

  useDemo(): void {
    this.slug = 'corely-demo';
    this.identifier = 'admin@corely.io';
    this.password = 'Password@123';
    this.error = '';
  }

  async onSubmit(): Promise<void> {
    if (this.loading) return;

    if (!this.slug || !this.identifier || !this.password) {
      this.error = 'All fields are required.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login({
        identifier: this.identifier,
        password: this.password,
        slug: this.slug,
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err?.message || 'Authentication failed. Please check your credentials.';
      this.loading = false;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
