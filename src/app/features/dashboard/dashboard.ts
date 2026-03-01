import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Store,
  ClipboardList,
  BarChart3,
  UserCircle,
  Truck,
  Boxes,
  ArrowRight,
} from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { BadgeComponent } from '../../shared/components/badge/badge';

interface DashboardData {
  today: { sales_count: number; revenue: number; tax_collected: number };
  this_month: { sales_count: number; revenue: number; tax_collected: number };
  low_stock_items: { name: string; sku: string; current_stock: number; min_stock: number }[];
  pending_payments: { count: number; total_due: number };
  total_items?: number;
  total_customers?: number;
  total_vendors?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BadgeComponent],
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
  readonly DollarSign = DollarSign;
  readonly UsersIcon = Users;
  readonly PackageIcon = Package;
  readonly AlertTriangle = AlertTriangle;
  readonly ShoppingCart = ShoppingCart;
  readonly FileText = FileText;
  readonly StoreIcon = Store;
  readonly ClipboardList = ClipboardList;
  readonly BarChart3 = BarChart3;
  readonly UserCircle = UserCircle;
  readonly Truck = Truck;
  readonly Boxes = Boxes;
  readonly ArrowRight = ArrowRight;

  loading = signal(true);
  data = signal<DashboardData | null>(null);

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  userName = computed(() => this.auth.user()?.name || 'there');
  userRole = computed(() => this.auth.user()?.role.split('_').join(' ').toUpperCase() || '');
  orgName = computed(() => this.auth.user()?.organization?.name || '');

  modules = [
    {
      name: 'Items',
      desc: 'Product catalog with pricing, GST slabs, and stock tracking',
      link: '/items',
      icon: this.PackageIcon,
      features: ['Add products', 'Set prices & GST', 'Track stock levels'],
    },
    {
      name: 'POS',
      desc: 'Create sales, accept payments, and print bills',
      link: '/pos',
      icon: this.ShoppingCart,
      features: ['Billing screen', 'Payment modes', 'Hold & resume sales'],
    },
    {
      name: 'Inventory',
      desc: 'Track stock movements, purchases, and adjustments',
      link: '/inventory',
      icon: this.Boxes,
      features: ['Purchase entries', 'Stock adjustments', 'Movement history'],
    },
    {
      name: 'Invoices',
      desc: 'GST-compliant invoices, credit notes, and challans',
      link: '/invoices',
      icon: this.FileText,
      features: ['Tax invoices', 'Credit/Debit notes', 'GST auto-calc'],
    },
    {
      name: 'Customers',
      desc: 'Manage buyers, track balances, and payment terms',
      link: '/customers',
      icon: this.UsersIcon,
      features: ['Customer profiles', 'Credit limits', 'Outstanding dues'],
    },
    {
      name: 'Vendors',
      desc: 'Supplier management with payment and compliance tracking',
      link: '/vendors',
      icon: this.Truck,
      features: ['Vendor profiles', 'GSTIN/TDS info', 'Payment tracking'],
    },
    {
      name: 'Stores',
      desc: 'Manage shops, branches, godowns, and locations',
      link: '/stores',
      icon: this.StoreIcon,
      features: ['Multi-location', 'Contact info', 'Operating hours'],
    },
    {
      name: 'Reports',
      desc: 'Business analytics, top items, sales trends, and GST summary',
      link: '/reports',
      icon: this.BarChart3,
      features: ['Sales analytics', 'Stock valuation', 'GST reports'],
    },
  ];

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.api.get<DashboardData>('/reports/dashboard').subscribe({
      next: (res) => {
        if (res.success && res.data) this.data.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
