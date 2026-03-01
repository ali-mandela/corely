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
  selector: 'app-item-form',
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
  templateUrl: './item-form.html',
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
export class ItemFormComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Save = Save;

  isEdit = false;
  itemId = '';
  loading = false;
  saving = false;

  form: any = {
    name: '',
    sku: '',
    barcode: '',
    description: '',
    category: 'other',
    sub_category: '',
    brand: '',
    manufacturer: '',
    model_number: '',
    unit: 'pcs',
    secondary_unit: '',
    conversion_factor: null,
    pricing: {
      cost_price: 0,
      selling_price: 0,
      mrp: null,
      wholesale_price: null,
      min_wholesale_qty: null,
      tax_rate: '18',
      hsn_code: '',
      discount_percent: null,
    },
    stock: {
      current_stock: 0,
      min_stock_level: null,
      reorder_level: null,
      reorder_qty: null,
      max_stock_level: null,
      location: '',
    },
    status: 'active',
    is_sellable: true,
    is_purchasable: true,
  };

  categoryOptions: SelectOption[] = [
    { label: 'Cement & Concrete', value: 'cement_concrete' },
    { label: 'Steel & Metals', value: 'steel_metals' },
    { label: 'Timber & Plywood', value: 'timber_plywood' },
    { label: 'Bricks & Blocks', value: 'bricks_blocks' },
    { label: 'Sand & Aggregates', value: 'sand_aggregates' },
    { label: 'Paints & Coatings', value: 'paints_coatings' },
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'Tiles & Flooring', value: 'tiles_flooring' },
    { label: 'Roofing', value: 'roofing' },
    { label: 'Doors & Windows', value: 'doors_windows' },
    { label: 'Tools & Equipment', value: 'tools_equipment' },
    { label: 'Fasteners & Hardware', value: 'fasteners_hardware' },
    { label: 'Safety Gear', value: 'safety_gear' },
    { label: 'Adhesives & Sealants', value: 'adhesives_sealants' },
    { label: 'Glass', value: 'glass' },
    { label: 'Waterproofing', value: 'waterproofing' },
    { label: 'Pipes & Fittings', value: 'pipes_fittings' },
    { label: 'Wires & Cables', value: 'wires_cables' },
    { label: 'Lighting', value: 'lighting' },
    { label: 'Bathroom & Sanitary', value: 'bathroom_sanitary' },
    { label: 'Kitchen Fittings', value: 'kitchen_fittings' },
    { label: 'Garden & Outdoor', value: 'garden_outdoor' },
    { label: 'Power Tools', value: 'power_tools' },
    { label: 'Other', value: 'other' },
  ];

  unitOptions: SelectOption[] = [
    { label: 'Piece (pcs)', value: 'pcs' },
    { label: 'Kg', value: 'kg' },
    { label: 'Gram', value: 'g' },
    { label: 'Meter', value: 'm' },
    { label: 'Foot', value: 'ft' },
    { label: 'Sq. Meter', value: 'sq_m' },
    { label: 'Sq. Foot', value: 'sq_ft' },
    { label: 'Liter', value: 'ltr' },
    { label: 'Box', value: 'box' },
    { label: 'Bag', value: 'bag' },
    { label: 'Bundle', value: 'bundle' },
    { label: 'Roll', value: 'roll' },
    { label: 'Sheet', value: 'sheet' },
    { label: 'Set', value: 'set' },
    { label: 'Pair', value: 'pair' },
    { label: 'Packet', value: 'pkt' },
    { label: 'Dozen', value: 'dozen' },
    { label: 'Ton', value: 'ton' },
    { label: 'Quintal', value: 'quintal' },
    { label: 'CFT', value: 'cft' },
  ];

  taxOptions: SelectOption[] = [
    { label: 'GST 0%', value: '0' },
    { label: 'GST 5%', value: '5' },
    { label: 'GST 12%', value: '12' },
    { label: 'GST 18%', value: '18' },
    { label: 'GST 28%', value: '28' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Discontinued', value: 'discontinued' },
    { label: 'Out of Stock', value: 'out_of_stock' },
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
      this.itemId = id;
      this.loadItem();
    }
  }

  loadItem(): void {
    this.loading = true;
    this.api.get<any>(`/items/${this.itemId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.form = {
            name: d.name || '',
            sku: d.sku || '',
            barcode: d.barcode || '',
            description: d.description || '',
            category: d.category || 'other',
            sub_category: d.sub_category || '',
            brand: d.brand || '',
            manufacturer: d.manufacturer || '',
            model_number: d.model_number || '',
            unit: d.unit || 'pcs',
            secondary_unit: d.secondary_unit || '',
            conversion_factor: d.conversion_factor,
            pricing: { ...this.form.pricing, ...(d.pricing || {}) },
            stock: { ...this.form.stock, ...(d.stock || {}) },
            status: d.status || 'active',
            is_sellable: d.is_sellable ?? true,
            is_purchasable: d.is_purchasable ?? true,
          };
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.category) {
      this.toaster.warning('Name and category are required.');
      return;
    }
    this.saving = true;
    const payload = { ...this.form };

    if (this.isEdit) {
      this.api.put(`/items/${this.itemId}`, payload).subscribe({
        next: () => {
          this.toaster.success('Item updated.');
          this.router.navigate(['/items']);
        },
        error: () => (this.saving = false),
      });
    } else {
      this.api.post('/items', payload).subscribe({
        next: () => {
          this.toaster.success('Item created.');
          this.router.navigate(['/items']);
        },
        error: () => (this.saving = false),
      });
    }
  }
}
