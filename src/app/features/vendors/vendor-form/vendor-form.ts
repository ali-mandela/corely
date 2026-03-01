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
  selector: 'app-vendor-form',
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
  templateUrl: './vendor-form.html',
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
export class VendorFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  isEdit = false;
  vendorId = '';
  loading = false;
  saving = false;

  form: any = {
    name: '',
    display_name: '',
    phone: '',
    alt_phone: '',
    email: '',
    website: '',
    vendor_type: 'local_supplier',
    status: 'active',
    gstin: '',
    pan: '',
    msme_number: '',
    tds_applicable: false,
    tds_rate: null,
    payment_term: 'credit_30',
    credit_limit: null,
    bank_details: {
      account_holder: '',
      account_number: '',
      bank_name: '',
      branch: '',
      ifsc_code: '',
      upi_id: '',
    },
    address: {
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: '',
      state_code: '',
      pin_code: '',
      country: 'India',
    },
    avg_lead_time_days: null,
    min_order_value: null,
    notes: '',
  };

  typeOptions: SelectOption[] = [
    { label: 'Manufacturer', value: 'manufacturer' },
    { label: 'Distributor', value: 'distributor' },
    { label: 'Wholesaler', value: 'wholesaler' },
    { label: 'Dealer', value: 'dealer' },
    { label: 'Importer', value: 'importer' },
    { label: 'Local Supplier', value: 'local_supplier' },
    { label: 'Transporter', value: 'transporter' },
    { label: 'Contractor', value: 'contractor' },
    { label: 'Other', value: 'other' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Blacklisted', value: 'blacklisted' },
  ];

  paymentOptions: SelectOption[] = [
    { label: 'Advance', value: 'advance' },
    { label: 'Cash', value: 'cash' },
    { label: 'COD', value: 'cod' },
    { label: 'Credit 7 Days', value: 'credit_7' },
    { label: 'Credit 15 Days', value: 'credit_15' },
    { label: 'Credit 30 Days', value: 'credit_30' },
    { label: 'Credit 45 Days', value: 'credit_45' },
    { label: 'Credit 60 Days', value: 'credit_60' },
    { label: 'Credit 90 Days', value: 'credit_90' },
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
      this.vendorId = id;
      this.loadVendor();
    }
  }

  loadVendor(): void {
    this.loading = true;
    this.api.get<any>(`/vendors/${this.vendorId}`).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          const d = r.data;
          this.form = {
            name: d.name || '',
            display_name: d.display_name || '',
            phone: d.phone || '',
            alt_phone: d.alt_phone || '',
            email: d.email || '',
            website: d.website || '',
            vendor_type: d.vendor_type || 'local_supplier',
            status: d.status || 'active',
            gstin: d.gstin || '',
            pan: d.pan || '',
            msme_number: d.msme_number || '',
            tds_applicable: d.tds_applicable ?? false,
            tds_rate: d.tds_rate,
            payment_term: d.payment_term || 'credit_30',
            credit_limit: d.credit_limit,
            bank_details: { ...this.form.bank_details, ...(d.bank_details || {}) },
            address: { ...this.form.address, ...(d.address || {}) },
            avg_lead_time_days: d.avg_lead_time_days,
            min_order_value: d.min_order_value,
            notes: d.notes || '',
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

    if (this.isEdit) {
      this.api.put(`/vendors/${this.vendorId}`, this.form).subscribe({
        next: () => {
          this.toaster.success('Vendor updated.');
          this.router.navigate(['/vendors']);
        },
        error: () => (this.saving = false),
      });
    } else {
      this.api.post('/vendors', this.form).subscribe({
        next: () => {
          this.toaster.success('Vendor created.');
          this.router.navigate(['/vendors']);
        },
        error: () => (this.saving = false),
      });
    }
  }
}
