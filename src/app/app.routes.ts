import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell';
import { LoginComponent } from './features/auth/login/login';
import { DlsComponent } from './features/dls/dls';
import { DashboardComponent } from './features/dashboard/dashboard';
import { UsersListComponent } from './features/users/users-list/users-list';
import { UserFormComponent } from './features/users/user-form/user-form';
import { ItemsListComponent } from './features/items/items-list/items-list';
import { ItemFormComponent } from './features/items/item-form/item-form';
import { CustomersListComponent } from './features/customers/customers-list/customers-list';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form';
import { VendorsListComponent } from './features/vendors/vendors-list/vendors-list';
import { VendorFormComponent } from './features/vendors/vendor-form/vendor-form';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list';
import { StockMovementFormComponent } from './features/inventory/stock-movement-form/stock-movement-form';
import { StockAdjustmentFormComponent } from './features/inventory/stock-adjustment-form/stock-adjustment-form';
import { PurchaseEntryFormComponent } from './features/inventory/purchase-entry-form/purchase-entry-form';
import { PosListComponent } from './features/pos/pos-list/pos-list';
import { PosBillingComponent } from './features/pos/pos-billing/pos-billing';
import { InvoicesListComponent } from './features/invoices/invoices-list/invoices-list';
import { InvoiceFormComponent } from './features/invoices/invoice-form/invoice-form';
import { StoresListComponent } from './features/stores/stores-list/stores-list';
import { StoreFormComponent } from './features/stores/store-form/store-form';
import { AuditListComponent } from './features/audit/audit-list/audit-list';
import { ReportsComponent } from './features/reports/reports';
import { ProfileComponent } from './features/profile/profile';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login — Corely' },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard — Corely' },
      { path: 'dls', component: DlsComponent, title: 'Design System — Corely' },

      { path: 'users', component: UsersListComponent, title: 'Users — Corely' },
      { path: 'users/new', component: UserFormComponent, title: 'New User — Corely' },
      { path: 'users/:id/edit', component: UserFormComponent, title: 'Edit User — Corely' },

      { path: 'items', component: ItemsListComponent, title: 'Items — Corely' },
      { path: 'items/new', component: ItemFormComponent, title: 'New Item — Corely' },
      { path: 'items/:id/edit', component: ItemFormComponent, title: 'Edit Item — Corely' },

      { path: 'customers', component: CustomersListComponent, title: 'Customers — Corely' },
      { path: 'customers/new', component: CustomerFormComponent, title: 'New Customer — Corely' },
      {
        path: 'customers/:id/edit',
        component: CustomerFormComponent,
        title: 'Edit Customer — Corely',
      },

      { path: 'vendors', component: VendorsListComponent, title: 'Vendors — Corely' },
      { path: 'vendors/new', component: VendorFormComponent, title: 'New Vendor — Corely' },
      { path: 'vendors/:id/edit', component: VendorFormComponent, title: 'Edit Vendor — Corely' },

      { path: 'inventory', component: InventoryListComponent, title: 'Inventory — Corely' },
      {
        path: 'inventory/movement',
        component: StockMovementFormComponent,
        title: 'Stock Movement — Corely',
      },
      {
        path: 'inventory/adjustment',
        component: StockAdjustmentFormComponent,
        title: 'Stock Adjustment — Corely',
      },
      {
        path: 'inventory/purchase',
        component: PurchaseEntryFormComponent,
        title: 'Purchase Entry — Corely',
      },

      { path: 'pos', component: PosListComponent, title: 'Point of Sale — Corely' },
      { path: 'pos/billing', component: PosBillingComponent, title: 'POS Billing — Corely' },

      { path: 'invoices', component: InvoicesListComponent, title: 'Invoices — Corely' },
      { path: 'invoices/new', component: InvoiceFormComponent, title: 'Create Invoice — Corely' },

      { path: 'stores', component: StoresListComponent, title: 'Stores — Corely' },
      { path: 'stores/new', component: StoreFormComponent, title: 'New Store — Corely' },
      { path: 'stores/:id/edit', component: StoreFormComponent, title: 'Edit Store — Corely' },

      { path: 'audit', component: AuditListComponent, title: 'Audit Logs — Corely' },
      { path: 'reports', component: ReportsComponent, title: 'Reports — Corely' },
      { path: 'profile', component: ProfileComponent, title: 'Profile — Corely' },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
