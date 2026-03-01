import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../../shared/components/input/input';
import { TextareaComponent } from '../../../shared/components/textarea/textarea';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
import { ButtonComponent } from '../../../shared/components/button/button';

interface Product {
  _id: string;
  name: string;
  sku?: string;
  hsn_code?: string;
  unit?: string;
  cost_price?: number;
  gst_slab?: number;
}

interface LineItem {
  item_id: string;
  item_name: string;
  sku: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  // picker state per row
  searchQuery: string;
  showDropdown: boolean;
}

@Component({
  selector: 'app-purchase-entry-form',
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
  templateUrl: './purchase-entry-form.html',
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
export class PurchaseEntryFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Search = Search;
  saving = false;

  allItems = signal<Product[]>([]);
  supplier = { name: '', gstin: '', phone: '', email: '', state: '' };
  invoiceNumber = '';
  challanNumber = '';
  poNumber = '';
  paymentStatus = 'unpaid';
  paymentMode = '';
  notes = '';

  items = signal<LineItem[]>([this.emptyLine()]);

  paymentStatusOpts: SelectOption[] = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid', value: 'paid' },
  ];
  paymentModeOpts: SelectOption[] = [
    { label: '— Select —', value: '' },
    { label: 'Cash', value: 'cash' },
    { label: 'UPI', value: 'upi' },
    { label: 'NEFT/RTGS', value: 'neft_rtgs' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Credit', value: 'credit' },
  ];

  subtotal = computed(() => this.items().reduce((s, i) => s + i.unit_price * i.quantity, 0));
  totalGst = computed(() => this.items().reduce((s, i) => s + i.gst_amount, 0));
  grandTotal = computed(() => this.subtotal() + this.totalGst());

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.api.get<any>('/items', { limit: 100 }).subscribe({
      next: (r) => {
        if (r.success) this.allItems.set(r.data?.items || []);
      },
    });
  }

  emptyLine(): LineItem {
    return {
      item_id: '',
      item_name: '',
      sku: '',
      hsn_code: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      gst_rate: 18,
      gst_amount: 0,
      line_total: 0,
      searchQuery: '',
      showDropdown: false,
    };
  }

  addLine(): void {
    this.items.update((list) => [...list, this.emptyLine()]);
  }
  removeLine(idx: number): void {
    if (this.items().length > 1) this.items.update((list) => list.filter((_, i) => i !== idx));
  }

  filterItems(q: string): Product[] {
    const term = q.toLowerCase();
    return this.allItems()
      .filter(
        (i) => i.name.toLowerCase().includes(term) || (i.sku && i.sku.toLowerCase().includes(term)),
      )
      .slice(0, 15);
  }

  onLineSearch(idx: number): void {
    this.items.update((list) =>
      list.map((item, i) => (i === idx ? { ...item, showDropdown: true } : item)),
    );
  }

  selectLineItem(idx: number, product: Product): void {
    this.items.update((list) =>
      list.map((item, i) => {
        if (i !== idx) return item;
        const price = product.cost_price || 0;
        const gstRate = product.gst_slab || 18;
        const gst = +((price * 1 * gstRate) / 100).toFixed(2);
        return {
          ...item,
          item_id: product._id,
          item_name: product.name,
          sku: product.sku || '',
          hsn_code: product.hsn_code || '',
          unit: product.unit || 'pcs',
          unit_price: price,
          gst_rate: gstRate,
          gst_amount: gst,
          line_total: +(price + gst).toFixed(2),
          searchQuery: product.name,
          showDropdown: false,
        };
      }),
    );
  }

  recalcLine(idx: number): void {
    this.items.update((list) =>
      list.map((item, i) => {
        if (i !== idx) return item;
        const taxable = item.unit_price * item.quantity;
        const gst = +((taxable * item.gst_rate) / 100).toFixed(2);
        return { ...item, gst_amount: gst, line_total: +(taxable + gst).toFixed(2) };
      }),
    );
  }

  onSubmit(): void {
    if (!this.supplier.name) {
      this.toaster.warning('Supplier name is required.');
      return;
    }
    if (!this.items().some((i) => i.item_name)) {
      this.toaster.warning('Add at least one item.');
      return;
    }
    this.saving = true;
    const payload = {
      supplier: this.supplier,
      invoice_number: this.invoiceNumber || undefined,
      challan_number: this.challanNumber || undefined,
      po_number: this.poNumber || undefined,
      items: this.items().map(({ searchQuery, showDropdown, ...rest }) => rest),
      subtotal: this.subtotal(),
      total_gst: this.totalGst(),
      grand_total: this.grandTotal(),
      payment_status: this.paymentStatus,
      payment_mode: this.paymentMode || undefined,
      status: 'received',
      notes: this.notes || undefined,
    };
    this.api.post('/inventory/purchases', payload).subscribe({
      next: () => {
        this.toaster.success('Purchase entry created.');
        this.router.navigate(['/inventory']);
      },
      error: () => (this.saving = false),
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
