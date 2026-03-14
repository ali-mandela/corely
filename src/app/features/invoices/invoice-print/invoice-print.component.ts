import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Printer } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './invoice-print.component.html',
  styles: [
    `
      :host {
        display: block;
        background: #f1f5f9;
        min-height: 100vh;
      }

      /* ── Print Sheet ── */
      .print-sheet {
        width: 210mm;
        min-height: 297mm;
        margin: 24px auto;
        background: #fff;
        padding: 14mm 14mm 10mm;
        box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
        font-family: 'Arial', sans-serif;
        font-size: 11px;
        color: #1e293b;
        box-sizing: border-box;
      }

      /* ── Header ── */
      .print-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
      }
      .company-name {
        font-size: 16px;
        font-weight: 800;
        color: #1e293b;
        letter-spacing: -0.3px;
        margin-bottom: 4px;
      }
      .company-meta {
        font-size: 9.5px;
        color: #64748b;
        line-height: 1.6;
      }
      .invoice-title-block {
        text-align: right;
        min-width: 200px;
      }
      .invoice-type-label {
        font-size: 15px;
        font-weight: 900;
        color: #4338ca;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
      }
      .meta-table td {
        font-size: 9.5px;
        padding: 1.5px 0;
      }
      .meta-key {
        color: #94a3b8;
        padding-right: 12px;
        white-space: nowrap;
      }
      .meta-val {
        font-weight: 600;
        color: #1e293b;
        text-align: right;
      }

      /* ── Divider ── */
      .divider {
        border: none;
        border-top: 1.5px solid #e2e8f0;
        margin: 10px 0;
      }

      /* ── Parties ── */
      .parties-row {
        display: flex;
        gap: 24px;
      }
      .party-block {
        flex: 1;
      }
      .party-label {
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #94a3b8;
        margin-bottom: 4px;
      }
      .party-name {
        font-size: 12px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 2px;
      }
      .party-detail {
        font-size: 9.5px;
        color: #475569;
        line-height: 1.6;
      }

      /* ── Items Table ── */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
      }
      .items-table thead tr {
        background: #f8fafc;
      }
      .items-table th {
        font-size: 8.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
        padding: 6px 6px;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }
      .items-table td {
        font-size: 10px;
        padding: 6px 6px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: top;
      }
      .items-table tbody tr:last-child td {
        border-bottom: 1.5px solid #e2e8f0;
      }

      /* ── Bottom Section ── */
      .bottom-section {
        display: flex;
        gap: 16px;
        margin-top: 10px;
        align-items: flex-start;
      }
      .hsn-section {
        flex: 1;
      }
      .section-label {
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #94a3b8;
        margin-bottom: 4px;
        display: block;
      }
      .hsn-table {
        width: 100%;
        border-collapse: collapse;
      }
      .hsn-table th {
        font-size: 8px;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        padding: 4px 6px;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
      }
      .hsn-table td {
        font-size: 9.5px;
        padding: 4px 6px;
        border-bottom: 1px solid #f1f5f9;
      }

      /* ── Totals ── */
      .totals-block {
        min-width: 200px;
        border: 1px solid #e2e8f0;
        border-radius: 2px;
        overflow: hidden;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 10px;
        font-size: 9.5px;
        color: #475569;
        border-bottom: 1px solid #f1f5f9;
      }
      .totals-grand {
        display: flex;
        justify-content: space-between;
        padding: 7px 10px;
        font-size: 12px;
        font-weight: 900;
        color: #1e293b;
        background: #f8fafc;
        border-top: 1.5px solid #c7d2fe;
      }
      .amount-words {
        font-size: 8.5px;
        font-style: italic;
        color: #64748b;
        padding: 4px 10px 6px;
        background: #f8fafc;
      }

      /* ── Footer Notes ── */
      .footer-notes {
        font-size: 9.5px;
        color: #64748b;
        line-height: 1.6;
      }

      /* ── Signature ── */
      .signature-row {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
      }
      .signature-block {
        width: 40%;
      }
      .sig-label {
        font-size: 9.5px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 32px;
      }
      .sig-line {
        border-top: 1px solid #cbd5e1;
        margin-bottom: 4px;
      }
      .sig-sublabel {
        font-size: 9px;
        color: #94a3b8;
      }

      .print-footer {
        text-align: center;
        font-size: 8.5px;
        color: #cbd5e1;
        margin-top: 16px;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
      }

      /* ── Print Media ── */
      @media print {
        :host {
          background: white !important;
        }
        .no-print {
          display: none !important;
        }
        .print-sheet {
          margin: 0;
          box-shadow: none;
          padding: 10mm 12mm;
          width: 100%;
        }
      }
    `,
  ],
})
export class InvoicePrintComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Printer = Printer;

  invoice: any = null;
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/invoices']);
      return;
    }

    this.api.get<any>(`/invoices/${id}`).subscribe({
      next: (res) => {
        this.invoice = res.data?.invoice || res.data;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  print(): void {
    window.print();
  }

  getInvoiceTypeLabel(type: string): string {
    const map: Record<string, string> = {
      tax_invoice: 'Tax Invoice',
      credit_note: 'Credit Note',
      debit_note: 'Debit Note',
      proforma: 'Proforma Invoice',
      quotation: 'Quotation',
      delivery_challan: 'Delivery Challan',
    };
    return map[type] || type.replace(/_/g, ' ');
  }

  formatNum(v: number | null | undefined): string {
    if (v == null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  }
}
