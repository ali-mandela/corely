import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Truck,
  Warehouse,
  ClipboardList,
  UserCircle,
  BarChart3,
  Store,
  Shield,
  Layers,
  Settings,
  Bell,
  LogOut,
  Search,
  ChevronDown,
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ToasterComponent } from '../../shared/components/toaster/toaster';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ToasterComponent],
  templateUrl: './shell.html',
  styles: [
    `
      :host {
        display: flex;
        min-height: 100vh;
        width: 100%;
      }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.375rem 0.75rem;
        border-radius: 2px;
        font-size: 13px;
        font-weight: 500;
        color: #94a3b8;
        transition: all 0.2s;
      }
      .nav-link:hover {
        background: rgba(30, 41, 59, 0.5);
        color: #fff;
      }
      .nav-link.active {
        background: rgba(30, 41, 59, 0.5);
        color: #fff;
      }
      .page-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
      }
      .page-content > * {
        width: 100%;
      }
    `,
  ],
})
export class ShellComponent {
  readonly Layers = Layers;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly Package = Package;
  readonly Warehouse = Warehouse;
  readonly ShoppingCart = ShoppingCart;
  readonly Truck = Truck;
  readonly Store = Store;
  readonly FileText = FileText;
  readonly ClipboardList = ClipboardList;
  readonly Shield = Shield;
  readonly UserCircle = UserCircle;
  readonly BarChart3 = BarChart3;
  readonly Settings = Settings;
  readonly Bell = Bell;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly ChevronDown = ChevronDown;

  navItems = [
    { label: 'Dashboard', icon: this.LayoutDashboard, route: '/dashboard' },
    { label: 'Users', icon: this.Users, route: '/users' },
    { label: 'Items', icon: this.Package, route: '/items' },
    { label: 'Customers', icon: this.UserCircle, route: '/customers' },
    { label: 'Vendors', icon: this.Truck, route: '/vendors' },
    { label: 'Inventory', icon: this.Warehouse, route: '/inventory' },
    { label: 'POS', icon: this.ShoppingCart, route: '/pos' },
    { label: 'Invoices', icon: this.FileText, route: '/invoices' },
    { label: 'Stores', icon: this.Store, route: '/stores' },
    { label: 'Audit Logs', icon: this.Shield, route: '/audit' },
    { label: 'Reports', icon: this.BarChart3, route: '/reports' },
  ];

  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
