import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';

interface AuditLog {
  _id: string;
  module: string;
  action: string;
  description: string;
  resource_id?: string;
  changed_fields?: string[];
  http_method?: string;
  endpoint?: string;
  ip_address?: string;
  user_name?: string;
  created_at?: string;
}

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BadgeComponent],
  templateUrl: './audit-list.html',
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
export class AuditListComponent implements OnInit {
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Filter = Filter;

  logs = signal<AuditLog[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  moduleFilter = '';
  actionFilter = '';
  limit = 30;
  offset = 0;

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const p: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) p['q'] = this.searchQuery;
    if (this.moduleFilter) p['module'] = this.moduleFilter;
    if (this.actionFilter) p['action'] = this.actionFilter;
    this.api.get<{ logs: AuditLog[]; total: number }>('/audit', p).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.logs.set(r.data.logs);
          this.total.set(r.data.total);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.offset = 0;
    this.load();
  }
  nextPage(): void {
    if (this.offset + this.limit < this.total()) {
      this.offset += this.limit;
      this.load();
    }
  }
  prevPage(): void {
    if (this.offset > 0) {
      this.offset = Math.max(0, this.offset - this.limit);
      this.load();
    }
  }

  getActionBadge(a: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    switch (a) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'danger';
      case 'login':
      case 'logout':
        return 'warning';
      default:
        return 'neutral';
    }
  }
  getMethodColor(m: string): string {
    switch (m?.toUpperCase()) {
      case 'GET':
        return 'text-emerald-600';
      case 'POST':
        return 'text-blue-600';
      case 'PUT':
        return 'text-amber-600';
      case 'DELETE':
        return 'text-red-600';
      default:
        return 'text-slate-400';
    }
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }
  get totalPages(): number {
    return Math.ceil(this.total() / this.limit);
  }
}
