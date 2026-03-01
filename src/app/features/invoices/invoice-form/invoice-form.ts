import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2 } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../../shared/components/input/input';
import { TextareaComponent } from '../../../shared/components/textarea/textarea';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
import { ButtonComponent } from '../../../shared/components/button/button';

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
    `,
  ],
})
export class InvoiceFormComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  saving = false;

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

  items = signal<InvLineItem[]>([
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
    this.saving = true;

    const payload: any = {
      invoice_type: this.invoiceType,
      gst_type: this.gstType,
      status: this.status,
      buyer: this.buyer,
      items: this.items(),
      subtotal: this.subtotal(),
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
