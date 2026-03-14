import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2, Search, ShoppingCart } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../../shared/components/input/input';
import { TextareaComponent } from '../../../shared/components/textarea/textarea';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
import { ButtonComponent } from '../../../shared/components/button/button';
import { OnInit } from '@angular/core';

interface InvLineItem {
  description: string;
  item_id: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gst_rate: number;
  total_tax: number;
  line_total: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './invoice-form.html',
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
      .dropdown-container {
        position: relative;
      }
      .dropdown-results {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 50;
        max-height: 200px;
        overflow-y: auto;
      }
    `,
  ],
})
export class InvoiceFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Search = Search;
  readonly ShoppingCart = ShoppingCart;
  saving = signal(false);

  invoiceType = 'tax_invoice';
  gstType = 'cgst_sgst';
  status = 'issued';

  buyer = {
    name: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    state_code: '',
    pin_code: '',
    phone: '',
    email: '',
  };
  paymentTerms = '';
  dueDate = '';
  notes = '';
  termsAndConditions = '';

  // Search Logic
  customerSearchQuery = '';
  customers = signal<any[]>([]);
  showCustomerDropdown = signal(false);
  loadingCustomers = signal(false);

  products = signal<any[]>([]);
  activeItemIndex = -1;
  showItemDropdown = signal(false);
  loadingProducts = signal(false);
  globalSearchQuery = signal('');

  defaultStore: any = null;

  items = signal<InvLineItem[]>([]);

  typeOptions: SelectOption[] = [
    { label: 'Tax Invoice', value: 'tax_invoice' },
    { label: 'Credit Note', value: 'credit_note' },
    { label: 'Debit Note', value: 'debit_note' },
    { label: 'Quotation', value: 'quotation' },
    { label: 'Proforma', value: 'proforma' },
    { label: 'Delivery Challan', value: 'delivery_challan' },
  ];

  gstTypeOptions: SelectOption[] = [
    { label: 'CGST + SGST (Intra-state)', value: 'cgst_sgst' },
    { label: 'IGST (Inter-state)', value: 'igst' },
    { label: 'Exempt', value: 'exempt' },
    { label: 'Nil', value: 'nil' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Issued', value: 'issued' },
    { label: 'Paid', value: 'paid' },
  ];

  subtotal = computed(() => this.items().reduce((s, i) => s + i.unit_price * i.quantity, 0));
  totalTax = computed(() => this.items().reduce((s, i) => s + i.total_tax, 0));
  grandTotal = computed(() => Math.round(this.subtotal() + this.totalTax()));

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDefaultStore();
  }

  loadDefaultStore(): void {
    this.api.get<any>('/stores').subscribe({
      next: (res) => {
        const stores = res.data?.stores || [];
        this.defaultStore = stores.find((s: any) => s.is_default) || stores[0] || null;
      },
    });
  }

  searchCustomers(query: string): void {
    this.customerSearchQuery = query;
    this.buyer.name = query; // Keep manual entry possible
    if (query.length < 2) {
      this.customers.set([]);
      this.showCustomerDropdown.set(false);
      return;
    }
    this.loadingCustomers.set(true);
    this.api.get<any>('/customers', { query }).subscribe({
      next: (res) => {
        this.customers.set(res.data?.customers || []);
        this.showCustomerDropdown.set(true);
        this.loadingCustomers.set(false);
      },
      error: () => this.loadingCustomers.set(false),
    });
  }

  selectCustomer(c: any): void {
    this.buyer = {
      name: c.name,
      gstin: c.gstin || '',
      pan: c.pan || '',
      address: c.billing_address?.line1 || '',
      city: c.billing_address?.city || '',
      state: c.billing_address?.state || '',
      state_code: c.billing_address?.state_code || '',
      pin_code: c.billing_address?.pin_code || '',
      phone: c.phone || '',
      email: c.email || '',
    };
    this.customerSearchQuery = c.name;
    this.showCustomerDropdown.set(false);
  }

  searchItems(query: string, index: number): void {
    this.activeItemIndex = index;
    
    if (index === -1) {
      this.globalSearchQuery.set(query);
    } else {
      this.items.update((list) =>
        list.map((item, i) => (i === index ? { ...item, description: query } : item)),
      );
    }

    if (query.length < 2) {
      this.products.set([]);
      this.showItemDropdown.set(false);
      return;
    }

    this.loadingProducts.set(true);
    // Use 'q' for general search as identified in previous steps
    this.api.get<any>('/items', { q: query }).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        this.products.set(items);
        this.showItemDropdown.set(true); 
        this.loadingProducts.set(false);
      },
      error: () => {
        this.loadingProducts.set(false);
        this.showItemDropdown.set(false);
      },
    });
  }

  selectProduct(p: any): void {
    const index = this.activeItemIndex;
    if (index === -1) return;

    this.items.update((list) =>
      list.map((item, i) => {
        if (i !== index) return item;
        
        // Handle nested pricing or flatter object
        const pricing = p.pricing || {};
        const price = pricing.selling_price ?? p.selling_price ?? 0;
        const gstRate = +(pricing.tax_rate ?? p.gst_slab ?? 18);
        const hsn = pricing.hsn_code ?? p.hsn_code ?? '';
        
        const taxable = price * item.quantity;
        const tax = +((taxable * gstRate) / 100).toFixed(2);
        
        return {
          ...item,
          description: p.name,
          item_id: p._id,
          hsn_code: hsn,
          unit: p.unit || 'pcs',
          unit_price: price,
          gst_rate: gstRate,
          total_tax: tax,
          line_total: +(taxable + tax).toFixed(2),
        };
      }),
    );
    this.showItemDropdown.set(false);
    this.activeItemIndex = -1;
  }

  addProductToList(p: any): void {
    const pricing = p.pricing || {};
    const price = pricing.selling_price ?? p.selling_price ?? 0;
    const gstRate = +(pricing.tax_rate ?? p.gst_slab ?? 18);
    const hsn = pricing.hsn_code ?? p.hsn_code ?? '';
    
    const quantity = 1;
    const taxable = price * quantity;
    const tax = +((taxable * gstRate) / 100).toFixed(2);

    const newItem: InvLineItem = {
      description: p.name,
      item_id: p._id,
      hsn_code: hsn,
      quantity: quantity,
      unit: p.unit || 'pcs',
      unit_price: price,
      gst_rate: gstRate,
      total_tax: tax,
      line_total: +(taxable + tax).toFixed(2),
    };

    this.items.update(list => [...list, newItem]);
    this.showItemDropdown.set(false);
    this.activeItemIndex = -1;
    this.globalSearchQuery.set('');
    this.products.set([]);
  }

  addLine(): void {
    this.items.update((list) => [
      ...list,
      {
        description: '',
        item_id: '',
        hsn_code: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        gst_rate: 18,
        total_tax: 0,
        line_total: 0,
      },
    ]);
  }

  removeLine(idx: number): void {
    if (this.items().length <= 1) return;
    this.items.update((list) => list.filter((_, i) => i !== idx));
  }

  recalcLine(idx: number): void {
    this.items.update((list) =>
      list.map((item, i) => {
        if (i !== idx) return item;
        const taxable = item.unit_price * item.quantity;
        const tax = +((taxable * item.gst_rate) / 100).toFixed(2);
        return { ...item, total_tax: tax, line_total: +(taxable + tax).toFixed(2) };
      }),
    );
  }

  onSubmit(): void {
    if (!this.buyer.name) {
      this.toaster.warning('Buyer name is required.');
      return;
    }
    this.saving.set(true);

    const payload: any = {
      invoice_type: this.invoiceType,
      gst_type: this.gstType,
      status: this.status,
      seller: this.defaultStore ? {
        name: this.defaultStore.name,
        gstin: this.defaultStore.gstin || '',
        address_line1: this.defaultStore.address?.line1 || '',
        city: this.defaultStore.address?.city || '',
        state: this.defaultStore.address?.state || '',
        state_code: this.defaultStore.address?.state_code || '',
        pin_code: this.defaultStore.address?.pin_code || '',
        phone: this.defaultStore.contact?.phone || '',
        email: this.defaultStore.contact?.email || '',
      } : undefined,
      buyer: {
        ...this.buyer,
        address_line1: this.buyer.address // Map frontend 'address' to backend 'address_line1' if needed
      },
      items: this.items().map(item => ({
        ...item,
        item_id: item.item_id || undefined,
        taxable_amount: +(item.unit_price * item.quantity).toFixed(2)
      })),
      subtotal: this.subtotal(),
      taxable_total: this.subtotal(),
      total_tax: this.totalTax(),
      grand_total: this.grandTotal(),
      payment_terms: this.paymentTerms || undefined,
      due_date: this.dueDate || undefined,
      notes: this.notes || undefined,
      terms_and_conditions: this.termsAndConditions || undefined,
    };

    this.api.post('/invoices', payload).subscribe({
      next: () => {
        this.toaster.success('Invoice created.');
        this.router.navigate(['/invoices']);
      },
      error: () => this.saving.set(false),
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(v);
  }
}
