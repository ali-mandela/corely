import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Search } from 'lucide-angular';
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
  unit?: string;
  selling_price?: number;
}

@Component({
  selector: 'app-stock-movement-form',
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
  templateUrl: './stock-movement-form.html',
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
export class StockMovementFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Search = Search;
  saving = false;

  // Item picker
  itemSearch = '';
  allItems = signal<Product[]>([]);
  filteredItems = signal<Product[]>([]);
  showDropdown = signal(false);
  selectedItem = signal<Product | null>(null);

  form: any = {
    item_id: '',
    item_name: '',
    sku: '',
    movement_type: 'stock_in',
    quantity: null,
    unit: 'pcs',
    unit_cost: null,
    reference_type: '',
    reference_id: '',
    from_location: '',
    to_location: '',
    batch_number: '',
    reason: '',
    notes: '',
  };

  movementTypes: SelectOption[] = [
    { label: 'Stock In (Purchase)', value: 'stock_in' },
    { label: 'Stock Out (Sold)', value: 'stock_out' },
    { label: 'Adjustment', value: 'adjustment' },
    { label: 'Transfer In', value: 'transfer_in' },
    { label: 'Transfer Out', value: 'transfer_out' },
    { label: 'Return In (Customer)', value: 'return_in' },
    { label: 'Return Out (Supplier)', value: 'return_out' },
    { label: 'Opening Stock', value: 'opening_stock' },
  ];

  reasonOptions: SelectOption[] = [
    { label: '— None —', value: '' },
    { label: 'Physical Count', value: 'physical_count' },
    { label: 'Damage', value: 'damage' },
    { label: 'Expired', value: 'expired' },
    { label: 'Theft / Loss', value: 'theft_loss' },
    { label: 'Sample', value: 'sample' },
    { label: 'Wastage', value: 'wastage' },
    { label: 'Correction', value: 'correction' },
    { label: 'Other', value: 'other' },
  ];

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

  onItemSearch(): void {
    const q = this.itemSearch.toLowerCase();
    this.filteredItems.set(
      this.allItems()
        .filter(
          (i) => i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)),
        )
        .slice(0, 20),
    );
    this.showDropdown.set(true);
  }

  selectItem(item: Product): void {
    this.selectedItem.set(item);
    this.form.item_id = item._id;
    this.form.item_name = item.name;
    this.form.sku = item.sku || '';
    this.form.unit = item.unit || 'pcs';
    this.itemSearch = item.name;
    this.showDropdown.set(false);
  }

  clearItem(): void {
    this.selectedItem.set(null);
    this.form.item_id = '';
    this.form.item_name = '';
    this.form.sku = '';
    this.itemSearch = '';
  }

  onSubmit(): void {
    if (!this.form.item_id || !this.form.quantity) {
      this.toaster.warning('Select an item and enter quantity.');
      return;
    }
    this.saving = true;
    this.api
      .post('/inventory/movements', { ...this.form, reason: this.form.reason || undefined })
      .subscribe({
        next: () => {
          this.toaster.success('Stock movement recorded.');
          this.router.navigate(['/inventory']);
        },
        error: () => (this.saving = false),
      });
  }
}
