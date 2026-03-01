import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ChevronLeft, ChevronRight, FileText } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';

interface Invoice {
  _id: string;
  invoice_number?: string;
  invoice_type: string;
  buyer?: { name: string };
  grand_total: number;
  status: string;
  invoice_date?: string;
  due_date?: string;
}

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BadgeComponent],
  templateUrl: './invoices-list.html',
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
export class InvoicesListComponent implements OnInit {
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly FileText = FileText;

  invoices = signal<Invoice[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
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
    if (this.typeFilter) p['invoice_type'] = this.typeFilter;
    this.api.get<{ invoices: Invoice[]; total: number }>('/invoices', p).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.invoices.set(r.data.invoices);
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
      case 'paid':
        return 'success';
      case 'issued':
        return 'info';
      case 'partially_paid':
        return 'warning';
      case 'overdue':
        return 'danger';
      case 'draft':
        return 'neutral';
      case 'cancelled':
        return 'danger';
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
