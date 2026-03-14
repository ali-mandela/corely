import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2 } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, ButtonComponent],
  templateUrl: './invoice-edit.component.html',
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
      .input-field {
        @apply w-full bg-white border border-slate-200 rounded-sm px-2.5 py-2 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-300;
      }
      .input-field:focus {
        @apply border-indigo-400;
      }
      .item-input {
        @apply bg-transparent border-b border-transparent text-[11px] text-slate-700 outline-none px-1 py-0.5 transition-colors;
      }
      .item-input:focus {
        @apply border-indigo-300;
      }
    `,
  ],
})
export class InvoiceEditComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  invoice: any = null;
  loading = signal(true);
  saving = signal(false);

  form: any = {
    status: 'issued',
    due_date: '',
    place_of_supply: '',
    place_of_supply_code: '',
    gst_type: 'cgst_sgst',
    reverse_charge: false,
    seller: {
      name: '',
      gstin: '',
      pan: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      state_code: '',
      pin_code: '',
      phone: '',
      email: '',
    },
    buyer: {
      name: '',
      gstin: '',
      pan: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      state_code: '',
      pin_code: '',
      phone: '',
      email: '',
    },
    items: [],
    notes: '',
    terms_and_conditions: '',
    transport_mode: '',
    vehicle_number: '',
    eway_bill_number: '',
  };

  get totals() {
    const subtotal = this.form.items.reduce(
      (s: number, i: any) => s + (i.unit_price || 0) * (i.quantity || 0),
      0,
    );
    const total_tax = this.form.items.reduce((s: number, i: any) => s + (i.total_tax || 0), 0);
    return {
      subtotal: +subtotal.toFixed(2),
      total_tax: +total_tax.toFixed(2),
      grand_total: Math.round(subtotal + total_tax),
    };
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toaster: ToasterService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/invoices']);
      return;
    }

    this.api.get<any>(`/invoices/${id}`).subscribe({
      next: (res) => {
        this.invoice = res.data?.invoice || res.data;
        this.patchForm(this.invoice);
        this.loading.set(false);
      },
      error: () => {
        this.toaster.error('Failed to load invoice.');
        this.loading.set(false);
      },
    });
  }

  patchForm(inv: any): void {
    this.form.status = inv.status || 'issued';
    this.form.due_date = inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : '';
    this.form.place_of_supply = inv.place_of_supply || '';
    this.form.place_of_supply_code = inv.place_of_supply_code || '';
    this.form.gst_type = inv.gst_type || 'cgst_sgst';
    this.form.reverse_charge = inv.reverse_charge || false;
    this.form.notes = inv.notes || '';
    this.form.terms_and_conditions = inv.terms_and_conditions || '';
    this.form.transport_mode = inv.transport_mode || '';
    this.form.vehicle_number = inv.vehicle_number || '';
    this.form.eway_bill_number = inv.eway_bill_number || '';

    this.form.seller = { ...inv.seller };
    this.form.buyer = { ...inv.buyer };

    this.form.items = (inv.items || []).map((item: any) => ({ ...item }));
  }

  recalcItem(index: number): void {
    const item = this.form.items[index];
    const taxable = (item.unit_price || 0) * (item.quantity || 0);
    item.taxable_amount = +taxable.toFixed(2);
    item.total_tax = +((taxable * (item.gst_rate || 0)) / 100).toFixed(2);
    item.line_total = +(taxable + item.total_tax).toFixed(2);
  }

  addItem(): void {
    this.form.items.push({
      description: '',
      item_id: null,
      hsn_code: '',
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      gst_rate: 18,
      taxable_amount: 0,
      total_tax: 0,
      line_total: 0,
    });
  }

  removeItem(index: number): void {
    this.form.items.splice(index, 1);
  }

  save(): void {
    const t = this.totals;
    const payload = {
      ...this.form,
      subtotal: t.subtotal,
      taxable_total: t.subtotal,
      total_tax: t.total_tax,
      grand_total: t.grand_total,
    };

    // Clean empty strings to null for optional fields
    ['due_date', 'place_of_supply', 'transport_mode', 'vehicle_number', 'eway_bill_number'].forEach(
      (k) => {
        if (payload[k] === '') payload[k] = null;
      },
    );

    this.saving.set(true);
    this.api.put(`/invoices/${this.invoice._id}`, payload).subscribe({
      next: () => {
        this.toaster.success('Invoice updated successfully.');
        this.saving.set(false);
        this.router.navigate(['/invoices']);
      },
      error: () => {
        this.toaster.error('Failed to save invoice.');
        this.saving.set(false);
      },
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v);
  }
}
