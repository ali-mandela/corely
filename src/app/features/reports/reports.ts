import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  Package,
  Users,
  Truck,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
} from 'lucide-angular';

import { BadgeComponent } from '../../shared/components/badge/badge';
import { ButtonComponent } from '../../shared/components/button/button';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BadgeComponent, ButtonComponent],
  templateUrl: './reports.html',
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
export class ReportsComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly Package = Package;
  readonly Users = Users;
  readonly Truck = Truck;
  readonly IndianRupee = IndianRupee;
  readonly AlertTriangle = AlertTriangle;
  readonly RefreshCw = RefreshCw;

  loading = signal(true);
  valuation = signal<any>(null);
  topItems = signal<any[]>([]);
  topCustomers = signal<any[]>([]);
  vendorDues = signal<any[]>([]);
  lowStock = signal<any[]>([]);
  gstSummary = signal<any>(null);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded >= 5) this.loading.set(false);
    };

    this.api.get<any>('/reports/inventory/valuation').subscribe({
      next: (r) => {
        if (r.success) this.valuation.set(r.data);
        done();
      },
      error: done,
    });
    this.api.get<any>('/reports/sales/top-items', { limit: 10, days: 30 }).subscribe({
      next: (r) => {
        if (r.success) this.topItems.set(r.data?.items || []);
        done();
      },
      error: done,
    });
    this.api.get<any>('/reports/customers/top', { limit: 10, days: 90 }).subscribe({
      next: (r) => {
        if (r.success) this.topCustomers.set(r.data?.customers || []);
        done();
      },
      error: done,
    });
    this.api.get<any>('/reports/vendors/dues').subscribe({
      next: (r) => {
        if (r.success) this.vendorDues.set(r.data?.vendors || []);
        done();
      },
      error: done,
    });
    this.api.get<any>('/reports/inventory/low-stock', { limit: 20 }).subscribe({
      next: (r) => {
        if (r.success) this.lowStock.set(r.data?.items || []);
        done();
      },
      error: done,
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v || 0);
  }
}
