import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ShoppingCart,
  FileText,
} from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { ToasterService } from '../../shared/components/toaster/toaster.service';
import { BadgeComponent } from '../../shared/components/badge/badge';

interface DashboardData {
  today: { sales_count: number; revenue: number; tax_collected: number };
  this_month: { sales_count: number; revenue: number; tax_collected: number };
  low_stock_items: { name: string; sku: string; current_stock: number; min_stock: number }[];
  pending_payments: { count: number; total_due: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BadgeComponent],
  templateUrl: './dashboard.html',
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
export class DashboardComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly DollarSign = DollarSign;
  readonly UsersIcon = Users;
  readonly PackageIcon = Package;
  readonly AlertTriangle = AlertTriangle;
  readonly ShoppingCart = ShoppingCart;
  readonly FileText = FileText;

  loading = signal(true);
  data = signal<DashboardData | null>(null);

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.api.get<DashboardData>('/reports/dashboard').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.data.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
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
}
