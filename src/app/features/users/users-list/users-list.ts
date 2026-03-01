import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Plus,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { FormsModule } from '@angular/forms';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation?: string;
  is_active: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    BadgeComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './users-list.html',
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
export class UsersListComponent implements OnInit {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly MoreVertical = MoreVertical;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  users = signal<User[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  limit = 20;
  offset = 0;

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) params['q'] = this.searchQuery;

    this.api.get<{ users: User[]; total: number }>('/users', params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data.users);
          this.total.set(res.data.total);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.offset = 0;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.total()) {
      this.offset += this.limit;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset = Math.max(0, this.offset - this.limit);
      this.loadUsers();
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    this.api.delete(`/users/${user._id}`).subscribe({
      next: () => {
        this.toaster.success(`User "${user.name}" deleted.`);
        this.loadUsers();
      },
    });
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.limit);
  }

  getRoleBadge(role: string): 'success' | 'info' | 'warning' | 'neutral' {
    switch (role) {
      case 'super_admin':
        return 'success';
      case 'admin':
        return 'info';
      case 'manager':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
