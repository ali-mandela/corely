import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Layers } from 'lucide-angular';
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

  identifier = '';
  password = '';
  slug = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    if (!this.identifier || !this.password || !this.slug) {
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
      this.error = err.message || 'Authentication failed. Please check your credentials.';
    } finally {
      this.loading = false;
    }
  }
}
