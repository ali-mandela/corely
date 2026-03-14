import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Printer } from 'lucide-angular';

@Component({
  selector: 'app-sale-receipt',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sale-receipt.html',
  styles: [
    `
      :host {
        display: block;
      }
      .animate-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { background: white !important; }
      }
    `,
  ],
})
export class SaleReceiptComponent {
  readonly X = X;
  readonly Printer = Printer;

  @Input() sale: any;
  @Output() close = new EventEmitter<void>();

  formatCurrency(v: number | undefined): string {
    if (v === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(v);
  }

  printReceipt(): void {
    window.print();
  }
}
