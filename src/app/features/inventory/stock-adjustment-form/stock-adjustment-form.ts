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
}

@Component({
  selector: 'app-stock-adjustment-form',
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
  templateUrl: './stock-adjustment-form.html',
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
export class StockAdjustmentFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;
  readonly Search = Search;
  saving = false;

  itemSearch = '';
  allItems = signal<Product[]>([]);
  filteredItems = signal<Product[]>([]);
  showDropdown = signal(false);
  selectedItem = signal<Product | null>(null);

  form: any = {
    item_id: '',
    item_name: '',
    sku: '',
    adjustment_type: 'increase',
    quantity: null,
    unit: 'pcs',
    reason: 'physical_count',
    notes: '',
    location: '',
  };

  typeOptions: SelectOption[] = [
    { label: 'Increase (Add stock)', value: 'increase' },
    { label: 'Decrease (Remove stock)', value: 'decrease' },
  ];

  reasonOptions: SelectOption[] = [
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
    this.api.post('/inventory/adjustments', this.form).subscribe({
      next: () => {
        this.toaster.success('Stock adjusted.');
        this.router.navigate(['/inventory']);
      },
      error: () => (this.saving = false),
    });
  }
}
