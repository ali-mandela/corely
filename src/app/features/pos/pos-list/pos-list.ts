import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';

interface Sale {
  _id: string;
  customer_name?: string;
  items_count?: number;
  grand_total: number;
  status: string;
  payments?: { mode: string; amount: number }[];
  created_at?: string;
}

@Component({
  selector: 'app-pos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, BadgeComponent],
  templateUrl: './pos-list.html',
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
export class PosListComponent implements OnInit {
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Eye = Eye;

  sales = signal<Sale[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  statusFilter = '';
  limit = 20;
  offset = 0;

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const p: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) p['q'] = this.searchQuery;
    if (this.statusFilter) p['status'] = this.statusFilter;
    this.api.get<{ sales: Sale[]; total: number }>('/pos/sales', p).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.sales.set(r.data.sales);
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

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v);
  }
  getStatusBadge(s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    switch (s) {
      case 'completed':
        return 'success';
      case 'draft':
        return 'neutral';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'info';
      default:
        return 'neutral';
    }
  }
  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }
  get totalPages(): number {
    return Math.ceil(this.total() / this.limit);
  }
}
