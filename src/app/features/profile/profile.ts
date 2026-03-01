import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Lock, Save } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToasterService } from '../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../shared/components/input/input';
import { ButtonComponent } from '../../shared/components/button/button'; 



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, InputComponent, ButtonComponent],
  templateUrl: './profile.html',
  styles: [
    `
      :host {
        display: block;
      }
      .animate-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  readonly UserIcon = User;
  readonly Lock = Lock;
  readonly Save = Save;

  savingProfile = false;
  savingPassword = false;

  profile = { name: '', phone: '', email: '', role: '', designation: '' };
  password = { current_password: '', new_password: '', confirm_password: '' };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toaster: ToasterService,
  ) {}

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.profile = {
        name: u.name || '',
        phone: u.phone || '',
        email: u.email || '',
        role: u.role || '',
        designation: u?.designation || '',
      };
    }
  }

  updateProfile(): void {
    if (!this.profile.name) {
      this.toaster.warning('Name is required.');
      return;
    }
    this.savingProfile = true;
    this.api.put('/profile/me', { name: this.profile.name, phone: this.profile.phone }).subscribe({
      next: () => {
        this.toaster.success('Profile updated.');
        this.savingProfile = false;
      },
      error: () => (this.savingProfile = false),
    });
  }

  changePassword(): void {
    if (!this.password.current_password || !this.password.new_password) {
      this.toaster.warning('All password fields are required.');
      return;
    }
    if (this.password.new_password.length < 8) {
      this.toaster.warning('New password must be at least 8 characters.');
      return;
    }
    if (this.password.new_password !== this.password.confirm_password) {
      this.toaster.warning('Passwords do not match.');
      return;
    }
    this.savingPassword = true;
    this.api.post('/profile/change-password', this.password).subscribe({
      next: () => {
        this.toaster.success('Password changed successfully.');
        this.password = { current_password: '', new_password: '', confirm_password: '' };
        this.savingPassword = false;
      },
      error: () => (this.savingPassword = false),
    });
  }
}
