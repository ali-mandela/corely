import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search, Edit, Trash2 } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { ToasterService } from '../../../shared/components/toaster/toaster.service';
import { BadgeComponent } from '../../../shared/components/badge/badge';
import { ButtonComponent } from '../../../shared/components/button/button';

interface Store {
  _id: string;
  name: string;
  code: string;
  store_type: string;
  status: string;
  address?: { city?: string; state?: string };
  contact?: { name?: string; phone?: string };
  is_default?: boolean;
}

@Component({
  selector: 'app-stores-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './stores-list.html',
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
export class StoresListComponent implements OnInit {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  stores = signal<Store[]>([]);
  loading = signal(true);

  constructor(
    private api: ApiService,
    private toaster: ToasterService,
  ) {}
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.get<{ stores: Store[] }>('/stores').subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.stores.set(r.data.stores);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteStore(s: Store): void {
    if (!confirm(`Delete "${s.name}"?`)) return;
    this.api.delete(`/stores/${s._id}`).subscribe({
      next: () => {
        this.toaster.success(`"${s.name}" deleted.`);
        this.load();
      },
    });
  }

  getStatusBadge(s: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (s) {
      case 'active':
        return 'success';
      case 'temporarily_closed':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
