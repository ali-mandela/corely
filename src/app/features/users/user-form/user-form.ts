import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { InputComponent } from '../../../shared/components/input/input';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './user-form.html',
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
export class UserFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;

  isEdit = false;
  userId = '';
  loading = false;
  saving = false;

  form: {
    name: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: string;
    designation: string;
    is_active: boolean | string;
    permissions: string[];
  } = {
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'employee',
    designation: '',
    is_active: true,
    permissions: [],
  };

  roleOptions: SelectOption[] = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Employee', value: 'employee' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ];

  availablePermissions = [
    { label: 'Users: Create', value: 'users:create' },
    { label: 'Users: Read', value: 'users:read' },
    { label: 'Users: Update', value: 'users:update' },
    { label: 'Users: Delete', value: 'users:delete' },
    { label: 'Products: Create', value: 'products:create' },
    { label: 'Products: Read', value: 'products:read' },
    { label: 'Products: Update', value: 'products:update' },
    { label: 'Products: Delete', value: 'products:delete' },
    { label: 'Customers: Create', value: 'customers:create' },
    { label: 'Customers: Read', value: 'customers:read' },
    { label: 'Customers: Update', value: 'customers:update' },
    { label: 'Customers: Delete', value: 'customers:delete' },
    { label: 'Inventory: Read', value: 'inventory:read' },
    { label: 'Inventory: Update', value: 'inventory:update' },
    { label: 'POS: Create', value: 'pos:create' },
    { label: 'Reports: Read', value: 'reports:read' },
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
      this.userId = id;
      this.loadUser();
    }
  }

  loadUser(): void {
    this.loading = true;
    this.api.get<any>(`/users/${this.userId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const u = res.data;
          this.form = {
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            username: u.username || '',
            password: '',
            role: u.role || 'employee',
            designation: u.designation || '',
            is_active: u.is_active ?? true,
            permissions: u.permissions || [],
          };
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  togglePermission(perm: string): void {
    const idx = this.form.permissions.indexOf(perm);
    if (idx > -1) {
      this.form.permissions.splice(idx, 1);
    } else {
      this.form.permissions.push(perm);
    }
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.phone) {
      this.toaster.warning('Please fill all required fields.');
      return;
    }

    this.saving = true;
    const payload: any = { ...this.form, is_active: String(this.form.is_active) === 'true' };

    if (this.isEdit) {
      delete payload.email;
      delete payload.password;
      delete payload.username;
      this.api.put(`/users/${this.userId}`, payload).subscribe({
        next: () => {
          this.toaster.success('User updated successfully.');
          this.router.navigate(['/users']);
        },
        error: () => (this.saving = false),
      });
    } else {
      if (!this.form.password) {
        this.toaster.warning('Password is required for new users.');
        this.saving = false;
        return;
      }
      this.api.post('/users', payload).subscribe({
        next: () => {
          this.toaster.success('User created successfully.');
          this.router.navigate(['/users']);
        },
        error: () => (this.saving = false),
      });
    }
  }
}
