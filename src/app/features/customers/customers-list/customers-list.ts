import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';
import { ButtonComponent } from '../../../shared/components/button/button';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  company_name?: string;
  customer_type: string;
  payment_term: string;
  credit_limit?: number;
  outstanding_balance?: number;
  gstin?: string;
  is_active: boolean;
}

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './customers-list.html',
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
export class CustomersListComponent implements OnInit {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  customers = signal<Customer[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  typeFilter = '';
  limit = 20;
  offset = 0;

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const p: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) p['q'] = this.searchQuery;
    if (this.typeFilter) p['customer_type'] = this.typeFilter;
    this.api.get<{ customers: Customer[]; total: number }>('/customers', p).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.customers.set(r.data.customers);
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

  deleteCustomer(c: Customer): void {
    if (!confirm(`Delete "${c.name}"?`)) return;
    this.api.delete(`/customers/${c._id}`).subscribe({
      next: () => {
        this.toaster.success(`"${c.name}" deleted.`);
        this.load();
      },
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v);
  }
  getTypeBadge(t: string): 'success' | 'info' | 'warning' | 'neutral' {
    switch (t) {
      case 'contractor':
      case 'builder':
        return 'info';
      case 'wholesale':
      case 'dealer':
        return 'warning';
      case 'government':
        return 'success';
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
