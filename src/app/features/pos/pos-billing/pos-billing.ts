import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  X,
} from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
// import { ApiService } from '../../core/services/api.service';
// import { ToasterService } from '../../shared/components/toaster/toaster.service';
// import { BadgeComponent } from '../../shared/components/badge/badge';
// import { ButtonComponent } from '../../shared/components/button/button';
// import { InputComponent } from '../../shared/components/input/input';
// import { SelectComponent, SelectOption } from '../../shared/components/select/select';

interface CartItem {
  item_id: string;
  item_name: string;
  sku?: string;
  hsn_code?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  mrp?: number;
  gst_rate: number;
  discount_type?: string;
  discount_value?: number;
  discount_amount: number;
  gst_amount: number;
  taxable_amount: number;
  line_total: number;
}

interface SearchItem {
  _id: string;
  name: string;
  sku?: string;
  hsn_code?: string;
  unit?: string;
  selling_price?: number;
  mrp?: number;
  gst_slab?: number;
  current_stock?: number;
}

@Component({
  selector: 'app-pos-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './pos-billing.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .animate-in {
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class PosBillingComponent {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly ShoppingCart = ShoppingCart;
  readonly CreditCard = CreditCard;
  readonly X = X;

  // Search
  searchQuery = '';
  searchResults = signal<SearchItem[]>([]);
  searching = signal(false);
  showResults = signal(false);

  // Cart
  cart = signal<CartItem[]>([]);

  // Customer
  customerName = '';
  customerPhone = '';

  // Bill-level discount
  billDiscountType = 'flat';
  billDiscountValue = 0;

  // Payment
  paymentMode = 'cash';
  amountReceived = 0;
  showPayment = signal(false);
  processing = signal(false);

  paymentOptions: SelectOption[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'UPI', value: 'upi' },
    { label: 'Card', value: 'card' },
    { label: 'Credit (Khata)', value: 'credit' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cheque', value: 'cheque' },
  ];

  // Computed totals
  subtotal = computed(() => this.cart().reduce((s, i) => s + i.taxable_amount, 0));
  totalTax = computed(() => this.cart().reduce((s, i) => s + i.gst_amount, 0));
  totalDiscount = computed(() => {
    const itemDisc = this.cart().reduce((s, i) => s + i.discount_amount, 0);
    return itemDisc + this.calcBillDiscount();
  });
  grandTotal = computed(() => {
    const raw = this.subtotal() + this.totalTax() - this.calcBillDiscount();
    return Math.round(raw); // Round off
  });
  changeDue = computed(() => Math.max(0, this.amountReceived - this.grandTotal()));
  itemCount = computed(() => this.cart().reduce((s, i) => s + i.quantity, 0));

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
    private router: Router,
  ) {}

  // ── Search ──
  onSearch(): void {
    if (this.searchQuery.length < 2) {
      this.showResults.set(false);
      return;
    }
    this.searching.set(true);
    this.showResults.set(true);
    this.api.get<any>('/items', { q: this.searchQuery, limit: 10 }).subscribe({
      next: (r) => {
        this.searchResults.set(r.data?.items || []);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
  }

  addToCart(item: SearchItem): void {
    const existing = this.cart().find((c) => c.item_id === item._id);
    if (existing) {
      this.updateQty(existing, existing.quantity + 1);
    } else {
      const price = item.selling_price || 0;
      const gstRate = item.gst_slab || 18;
      const gstAmt = +((price * gstRate) / 100).toFixed(2);
      const newItem: CartItem = {
        item_id: item._id,
        item_name: item.name,
        sku: item.sku,
        hsn_code: item.hsn_code,
        quantity: 1,
        unit: item.unit || 'pcs',
        unit_price: price,
        mrp: item.mrp,
        gst_rate: gstRate,
        discount_amount: 0,
        gst_amount: gstAmt,
        taxable_amount: price,
        line_total: +(price + gstAmt).toFixed(2),
      };
      this.cart.update((c) => [...c, newItem]);
    }
    this.searchQuery = '';
    this.showResults.set(false);
    this.toaster.success(`${item.name} added.`);
  }

  updateQty(item: CartItem, newQty: number): void {
    if (newQty < 1) return;
    this.cart.update((c) =>
      c.map((i) => {
        if (i.item_id !== item.item_id) return i;
        const taxable = +(i.unit_price * newQty - i.discount_amount).toFixed(2);
        const gst = +((taxable * i.gst_rate) / 100).toFixed(2);
        return {
          ...i,
          quantity: newQty,
          taxable_amount: taxable,
          gst_amount: gst,
          line_total: +(taxable + gst).toFixed(2),
        };
      }),
    );
  }

  removeItem(item: CartItem): void {
    this.cart.update((c) => c.filter((i) => i.item_id !== item.item_id));
  }

  clearCart(): void {
    if (this.cart().length && confirm('Clear all items?')) this.cart.set([]);
  }

  calcBillDiscount(): number {
    if (!this.billDiscountValue) return 0;
    if (this.billDiscountType === 'percentage') {
      return +((this.subtotal() * this.billDiscountValue) / 100).toFixed(2);
    }
    return this.billDiscountValue;
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(v);
  }

  // ── Payment ──
  openPayment(): void {
    if (!this.cart().length) {
      this.toaster.warning('Add items first.');
      return;
    }
    this.amountReceived = this.grandTotal();
    this.showPayment.set(true);
  }

  completeSale(): void {
    if (!this.cart().length) return;
    this.processing.set(true);

    const payload: any = {
      customer_name: this.customerName || undefined,
      customer_phone: this.customerPhone || undefined,
      items: this.cart().map((i) => ({
        item_id: i.item_id,
        item_name: i.item_name,
        sku: i.sku,
        hsn_code: i.hsn_code,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.unit_price,
        mrp: i.mrp,
        gst_rate: i.gst_rate,
        discount_amount: i.discount_amount,
        gst_amount: i.gst_amount,
        taxable_amount: i.taxable_amount,
        line_total: i.line_total,
      })),
      subtotal: this.subtotal(),
      total_discount: this.totalDiscount(),
      total_tax: this.totalTax(),
      grand_total: this.grandTotal(),
      payments: [{ mode: this.paymentMode, amount: this.grandTotal() }],
      amount_received: this.amountReceived,
      change_due: this.changeDue(),
      status: 'completed',
    };

    this.api.post('/pos/sales', payload).subscribe({
      next: () => {
        this.toaster.success('Sale completed!');
        this.cart.set([]);
        this.customerName = '';
        this.customerPhone = '';
        this.billDiscountValue = 0;
        this.showPayment.set(false);
        this.processing.set(false);
      },
      error: () => this.processing.set(false),
    });
  }

  holdSale(): void {
    if (!this.cart().length) return;
    this.processing.set(true);
    const payload: any = {
      customer_name: this.customerName || 'Walk-in',
      items: this.cart().map((i) => ({
        item_id: i.item_id,
        item_name: i.item_name,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.unit_price,
        gst_rate: i.gst_rate,
        line_total: i.line_total,
      })),
      subtotal: this.subtotal(),
      total_tax: this.totalTax(),
      grand_total: this.grandTotal(),
      status: 'on_hold',
      payments: [{ mode: 'cash', amount: 0 }],
    };
    this.api.post('/pos/sales', payload).subscribe({
      next: () => {
        this.toaster.success('Sale parked.');
        this.cart.set([]);
        this.processing.set(false);
      },
      error: () => this.processing.set(false),
    });
  }
}
