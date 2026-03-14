import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  Check,
  X,
  Printer,
  Pencil,
} from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { DatePipe } from '@angular/common';

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
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    BadgeComponent,
    InputComponent,
    ButtonComponent,
  ],
  providers: [DatePipe],
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
  readonly Receipt = Receipt;
  readonly Check = Check;
  readonly X = X;
  readonly Printer = Printer;

  invoices = signal<Invoice[]>([]);
  total = signal(0);
  loading = signal(true);
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  limit = 20;
  offset = 0;

  // Consolidated Invoicing
  showConsolidateModal = signal(false);
  customerSearchQuery = '';
  customers = signal<any[]>([]);
  showCustomerDropdown = signal(false);
  selectedCustomerId = signal<string | null>(null);
  selectedCustomer: any = null;

  loadingCustomers = signal(false);
  loadingSales = signal(false);
  pendingSales = signal<any[]>([]);
  selectedSaleIds = signal<Set<string>>(new Set());
  posStatusFilter = signal('completed');
  generating = signal(false);
  loadingStore = signal(false);
  defaultStore: any = null;

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}
  ngOnInit(): void {
    this.load();
    this.loadDefaultStore();
  }

  loadDefaultStore(): void {
    this.loadingStore.set(true);
    this.api.get<any>('/stores').subscribe({
      next: (res) => {
        const stores = res.data?.stores || [];
        this.defaultStore = stores.find((s: any) => s.is_default) || stores[0] || null;
        this.loadingStore.set(false);
      },
      error: () => this.loadingStore.set(false),
    });
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

  // --- Consolidated Helper Methods ---

  openConsolidateModal(): void {
    this.showConsolidateModal.set(true);
    this.resetConsolidateState();
  }

  resetConsolidateState(): void {
    this.customerSearchQuery = '';
    this.customers.set([]);
    this.selectedCustomerId.set(null);
    this.selectedCustomer = null;
    this.pendingSales.set([]);
    this.selectedSaleIds.set(new Set());
    this.posStatusFilter.set('completed');
  }

  searchCustomers(query: string): void {
    this.customerSearchQuery = query;
    if (query.length < 2) {
      this.customers.set([]);
      return;
    }

    this.loadingCustomers.set(true);
    this.api.get<any>('/customers', { query }).subscribe({
      next: (res) => {
        const data = res.data?.customers || [];
        this.customers.set(data);
        this.loadingCustomers.set(false);
        this.showCustomerDropdown.set(true);
      },
      error: () => this.loadingCustomers.set(false),
    });
  }

  selectCustomer(cust: any): void {
    this.selectedCustomer = cust;
    this.selectedCustomerId.set(cust._id);
    this.showCustomerDropdown.set(false);
    this.customerSearchQuery = cust.name;
    this.loadPendingSales(cust._id);
  }

  loadPendingSales(customerId: string): void {
    this.loadingSales.set(true);
    const params: any = { customer_id: customerId, limit: 50 };
    if (this.posStatusFilter()) params.status = this.posStatusFilter();

    this.api.get<any>('/pos/sales', params).subscribe({
      next: (res) => {
        const data = res.data?.sales || [];
        this.pendingSales.set(data);
        this.loadingSales.set(false);
      },
      error: () => this.loadingSales.set(false),
    });
  }

  toggleSaleSelection(saleId: string): void {
    const current = new Set(this.selectedSaleIds());
    if (current.has(saleId)) current.delete(saleId);
    else current.add(saleId);
    this.selectedSaleIds.set(current);
  }

  toggleAllSales(checked: boolean): void {
    if (checked) {
      this.selectedSaleIds.set(new Set(this.pendingSales().map((s) => s._id)));
    } else {
      this.selectedSaleIds.set(new Set());
    }
  }

  generateConsolidatedInvoice(): void {
    const salesToImport = this.pendingSales().filter((s) => this.selectedSaleIds().has(s._id));
    if (salesToImport.length === 0) return;

    this.generating.set(true);

    // Aggregate items
    const aggregatedItems: any[] = [];
    salesToImport.forEach((sale) => {
      sale.items.forEach((item: any) => {
        // Items are aggregated by ID AND effective unit price (after discount)
        // to maintain correct financials if the same item had different discounts
        const effectivePrice = item.taxable_amount / item.quantity;

        const existing = aggregatedItems.find(
          (ai) => ai.item_id === item.item_id && Math.abs(ai.unit_price - effectivePrice) < 0.01,
        );

        if (existing) {
          existing.quantity += item.quantity;
          const taxable = existing.unit_price * existing.quantity;
          existing.total_tax = +((taxable * (existing.gst_rate || 18)) / 100).toFixed(2);
          existing.line_total = +(taxable + existing.total_tax).toFixed(2);
        } else {
          aggregatedItems.push({
            description: item.item_name,
            item_id: item.item_id,
            hsn_code: item.hsn_code || '',
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            unit_price: effectivePrice,
            gst_rate: item.gst_rate || 18,
            total_tax: item.gst_amount || 0,
            line_total: item.line_total,
          });
        }
      });
    });

    const subtotal = aggregatedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const totalTax = aggregatedItems.reduce((s, i) => s + i.total_tax, 0);

    if (!this.defaultStore) {
      this.toaster.warning(
        'Seller information (Store) not found. Please ensure a store is created.',
      );
      this.loadDefaultStore(); // Try reloading
      return;
    }

    const payload: any = {
      invoice_type: 'tax_invoice',
      gst_type: 'cgst_sgst',
      status: 'issued',
      seller: {
        name: this.defaultStore.name,
        gstin: this.defaultStore.gstin || '',
        address_line1: this.defaultStore.address?.line1 || '',
        city: this.defaultStore.address?.city || '',
        state: this.defaultStore.address?.state || '',
        state_code: this.defaultStore.address?.state_code || '',
        pin_code: this.defaultStore.address?.pin_code || '',
        phone: this.defaultStore.contact?.phone || '',
        email: this.defaultStore.contact?.email || '',
      },
      buyer: {
        name: this.selectedCustomer.name,
        gstin: this.selectedCustomer.gstin || '',
        pan: this.selectedCustomer.pan || '',
        address: this.selectedCustomer.billing_address?.line1 || '',
        city: this.selectedCustomer.billing_address?.city || '',
        state: this.selectedCustomer.billing_address?.state || '',
        state_code: this.selectedCustomer.billing_address?.state_code || '',
        pin_code: this.selectedCustomer.billing_address?.pin_code || '',
        phone: this.selectedCustomer.phone || '',
        email: this.selectedCustomer.email || '',
      },
      items: aggregatedItems.map((item) => ({
        ...item,
        taxable_amount: +(item.unit_price * item.quantity).toFixed(2),
      })),
      subtotal: +subtotal.toFixed(2),
      taxable_total: +subtotal.toFixed(2),
      total_tax: +totalTax.toFixed(2),
      grand_total: Math.round(subtotal + totalTax),
      notes: `Consolidated from POS Sales: ${salesToImport.map((s) => s.invoice_number || s._id.slice(-8)).join(', ')}`,
    };

    this.api.post('/invoices', payload).subscribe({
      next: (res) => {
        this.toaster.success('Consolidated Invoice created successfully.');
        this.showConsolidateModal.set(false);
        this.generating.set(false);
        this.load(); // Refresh list
      },
      error: () => this.generating.set(false),
    });
  }

  readonly Pencil = Pencil;

  // View modal
  showViewModal = signal(false);
  selectedInvoice: any = null;

  openViewModal(inv: any): void {
    // Fetch full invoice details if needed
    this.api.get<any>(`/invoices/${inv._id}`).subscribe({
      next: (res) => {
        this.selectedInvoice = res.data?.invoice || res.data || inv;
        this.showViewModal.set(true);
      },
      error: () => {
        // Fallback to list data
        this.selectedInvoice = inv;
        this.showViewModal.set(true);
      },
    });
  }

  printInvoice(inv: any): void {
    // Navigate to print route or open print window
    window.open(`/invoices/${inv._id}/print`, '_blank');
  }
}
