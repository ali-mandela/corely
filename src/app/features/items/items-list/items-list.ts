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

interface Item {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category: string;
  brand?: string;
  unit: string;
  pricing?: { cost_price: number; selling_price: number; mrp?: number; tax_rate?: string };
  stock?: { current_stock: number; min_stock_level?: number };
  status: string;
}

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './items-list.html',
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
export class ItemsListComponent implements OnInit {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  items = signal<Item[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  categoryFilter = '';
  statusFilter = '';
  limit = 20;
  offset = 0;

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) params['q'] = this.searchQuery;
    if (this.categoryFilter) params['category'] = this.categoryFilter;
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.get<{ items: Item[]; total: number }>('/items', params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.items.set(res.data.items);
          this.total.set(res.data.total);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.offset = 0;
    this.loadItems();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.total()) {
      this.offset += this.limit;
      this.loadItems();
    }
  }

  prevPage(): void {
    if (this.offset > 0) {
      this.offset = Math.max(0, this.offset - this.limit);
      this.loadItems();
    }
  }

  deleteItem(item: Item): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.api.delete(`/items/${item._id}`).subscribe({
      next: () => {
        this.toaster.success(`"${item.name}" deleted.`);
        this.loadItems();
      },
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  getStatusBadge(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'neutral';
      case 'out_of_stock':
        return 'danger';
      case 'discontinued':
        return 'warning';
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
