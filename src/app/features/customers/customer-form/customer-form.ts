import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../../shared/components/input/input';
import { TextareaComponent } from '../../../shared/components/textarea/textarea';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-customer-form',
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
  templateUrl: './customer-form.html',
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
export class CustomerFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  isEdit = false;
  customerId = '';
  loading = false;
  saving = false;

  form: any = {
    name: '',
    phone: '',
    alt_phone: '',
    email: '',
    company_name: '',
    customer_type: 'retail',
    gstin: '',
    pan: '',
    payment_term: 'cash',
    credit_limit: null,
    notes: '',
    is_active: true,
    billing_address: {
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: '',
      state_code: '',
      pin_code: '',
      country: 'India',
    },
    shipping_address: {
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: '',
      state_code: '',
      pin_code: '',
      country: 'India',
    },
  };

  typeOptions: SelectOption[] = [
    { label: 'Retail', value: 'retail' },
    { label: 'Wholesale', value: 'wholesale' },
    { label: 'Contractor', value: 'contractor' },
    { label: 'Builder', value: 'builder' },
    { label: 'Dealer', value: 'dealer' },
    { label: 'Government', value: 'government' },
    { label: 'Institutional', value: 'institutional' },
    { label: 'Individual', value: 'individual' },
    { label: 'Other', value: 'other' },
  ];

  paymentOptions: SelectOption[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'Advance', value: 'advance' },
    { label: 'COD', value: 'cod' },
    { label: 'Credit 7 Days', value: 'credit_7' },
    { label: 'Credit 15 Days', value: 'credit_15' },
    { label: 'Credit 30 Days', value: 'credit_30' },
    { label: 'Credit 45 Days', value: 'credit_45' },
    { label: 'Credit 60 Days', value: 'credit_60' },
    { label: 'Credit 90 Days', value: 'credit_90' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ];

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.customerId = id;
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    this.loading = true;
    this.api.get<any>(`/customers/${this.customerId}`).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          const d = r.data;
          this.form = {
            name: d.name || '',
            phone: d.phone || '',
            alt_phone: d.alt_phone || '',
            email: d.email || '',
            company_name: d.company_name || '',
            customer_type: d.customer_type || 'retail',
            gstin: d.gstin || '',
            pan: d.pan || '',
            payment_term: d.payment_term || 'cash',
            credit_limit: d.credit_limit,
            notes: d.notes || '',
            is_active: d.is_active ?? true,
            billing_address: { ...this.form.billing_address, ...(d.billing_address || {}) },
            shipping_address: { ...this.form.shipping_address, ...(d.shipping_address || {}) },
          };
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.phone) {
      this.toaster.warning('Name and phone are required.');
      return;
    }
    this.saving = true;
    const payload = { ...this.form, is_active: String(this.form.is_active) === 'true' };

    if (this.isEdit) {
      this.api.put(`/customers/${this.customerId}`, payload).subscribe({
        next: () => {
          this.toaster.success('Customer updated.');
          this.router.navigate(['/customers']);
        },
        error: () => (this.saving = false),
      });
    } else {
      this.api.post('/customers', payload).subscribe({
        next: () => {
          this.toaster.success('Customer created.');
          this.router.navigate(['/customers']);
        },
        error: () => (this.saving = false),
      });
    }
  }
}
