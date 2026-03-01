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
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dls', component: DlsComponent },

      { path: 'users', component: UsersListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/:id/edit', component: UserFormComponent },

      { path: 'items', component: ItemsListComponent },
      { path: 'items/new', component: ItemFormComponent },
      { path: 'items/:id/edit', component: ItemFormComponent },

      { path: 'customers', component: CustomersListComponent },
      { path: 'customers/new', component: CustomerFormComponent },
      { path: 'customers/:id/edit', component: CustomerFormComponent },

      { path: 'vendors', component: VendorsListComponent },
      { path: 'vendors/new', component: VendorFormComponent },
      { path: 'vendors/:id/edit', component: VendorFormComponent },

      { path: 'inventory', component: InventoryListComponent },
      { path: 'inventory/movement', component: StockMovementFormComponent },
      { path: 'inventory/adjustment', component: StockAdjustmentFormComponent },
      { path: 'inventory/purchase', component: PurchaseEntryFormComponent },

      { path: 'pos', component: PosListComponent },
      { path: 'pos/billing', component: PosBillingComponent },

      { path: 'invoices', component: InvoicesListComponent },
      { path: 'invoices/new', component: InvoiceFormComponent },

      { path: 'stores', component: StoresListComponent },
      { path: 'stores/new', component: StoreFormComponent },
      { path: 'stores/:id/edit', component: StoreFormComponent },

      { path: 'audit', component: AuditListComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'profile', component: ProfileComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
