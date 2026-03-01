import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
} from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';

interface StockMovement {
  _id: string;
  item_name: string;
  sku?: string;
  movement_type: string;
  quantity: number;
  unit: string;
  reference_type?: string;
  from_location?: string;
  to_location?: string;
  reason?: string;
  notes?: string;
  created_at?: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BadgeComponent],
  templateUrl: './inventory-list.html',
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
export class InventoryListComponent implements OnInit {
  readonly Search = Search;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly ArrowUpFromLine = ArrowUpFromLine;
  readonly RefreshCw = RefreshCw;

  movements = signal<StockMovement[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  typeFilter = '';
  limit = 25;
  offset = 0;

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const p: Record<string, string | number> = { limit: this.limit, offset: this.offset };
    if (this.searchQuery) p['q'] = this.searchQuery;
    if (this.typeFilter) p['movement_type'] = this.typeFilter;
    this.api
      .get<{ movements: StockMovement[]; total: number }>('/inventory/movements', p)
      .subscribe({
        next: (r) => {
          if (r.success && r.data) {
            this.movements.set(r.data.movements);
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

  getTypeBadge(t: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    if (t.includes('in') || t === 'opening_stock') return 'success';
    if (t.includes('out')) return 'danger';
    if (t === 'adjustment') return 'warning';
    return 'info';
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }
  get totalPages(): number {
    return Math.ceil(this.total() / this.limit);
  }
}
