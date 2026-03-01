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
  selector: 'app-store-form',
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
  templateUrl: './store-form.html',
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
export class StoreFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  isEdit = false;
  storeId = '';
  loading = false;
  saving = false;

  form: any = {
    name: '',
    code: '',
    store_type: 'shop',
    status: 'active',
    is_default: false,
    gstin: '',
    manager_user_id: '',
    opening_time: '09:00',
    closing_time: '21:00',
    notes: '',
    address: { line1: '', line2: '', city: '', state: '', pin_code: '', landmark: '' },
    contact: { name: '', phone: '', email: '', role: '' },
  };

  typeOptions: SelectOption[] = [
    { label: 'Shop', value: 'shop' },
    { label: 'Branch', value: 'branch' },
    { label: 'Godown / Warehouse', value: 'godown' },
    { label: 'Construction Site', value: 'site' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Temporarily Closed', value: 'temporarily_closed' },
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
      this.storeId = id;
      this.loadStore();
    }
  }

  loadStore(): void {
    this.loading = true;
    this.api.get<any>(`/stores/${this.storeId}`).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          const d = r.data;
          this.form = {
            name: d.name || '',
            code: d.code || '',
            store_type: d.store_type || 'shop',
            status: d.status || 'active',
            is_default: d.is_default ?? false,
            gstin: d.gstin || '',
            manager_user_id: d.manager_user_id || '',
            opening_time: d.opening_time || '09:00',
            closing_time: d.closing_time || '21:00',
            notes: d.notes || '',
            address: { ...this.form.address, ...(d.address || {}) },
            contact: { ...this.form.contact, ...(d.contact || {}) },
          };
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.code) {
      this.toaster.warning('Name and code are required.');
      return;
    }
    this.saving = true;

    if (this.isEdit) {
      this.api.put(`/stores/${this.storeId}`, this.form).subscribe({
        next: () => {
          this.toaster.success('Store updated.');
          this.router.navigate(['/stores']);
        },
        error: () => (this.saving = false),
      });
    } else {
      this.api.post('/stores', this.form).subscribe({
        next: () => {
          this.toaster.success('Store created.');
          this.router.navigate(['/stores']);
        },
        error: () => (this.saving = false),
      });
    }
  }
}
