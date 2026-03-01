import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  Users,
  Palette,
  CheckCircle,
  AlertTriangle,
  XSquare,
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
  Layers,
  FileText,
} from 'lucide-angular';

@Component({
  selector: 'app-dls',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dls.html',
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
export class DlsComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Package = Package;
  readonly Users = Users;
  readonly Palette = Palette;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly XSquare = XSquare;
  readonly Search = Search;
  readonly Plus = Plus;
  readonly MoreVertical = MoreVertical;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Settings = Settings;
  readonly Bell = Bell;
  readonly LogOut = LogOut;
  readonly Layers = Layers;
  readonly FileText = FileText;

  brandColors = [
    { name: 'Primary (Navy)', hex: '#0f172a' },
    { name: 'Secondary', hex: '#334155' },
    { name: 'Accent (Indigo)', hex: '#6366f1' },
    { name: 'Slate 700', hex: '#334155' },
    { name: 'Slate 900', hex: '#020617' },
  ];

  neutralColors = [
    { name: 'Surface', hex: '#ffffff' },
    { name: 'Background', hex: '#f8fafc' },
    { name: 'Border Light', hex: '#f1f5f9' },
    { name: 'Border Base', hex: '#e2e8f0' },
    { name: 'Muted Text', hex: '#94a3b8' },
  ];

  semanticColors = [
    { name: 'Success', hex: '#10b981' },
    { name: 'Warning', hex: '#f59e0b' },
    { name: 'Critical', hex: '#ef4444' },
    { name: 'Info / Link', hex: '#3b82f6' },
  ];

  spacing = [
    { label: 'xs', value: '0.125rem', px: '2' },
    { label: 'sm', value: '0.25rem', px: '4' },
    { label: 'md', value: '0.5rem', px: '8' },
    { label: 'lg', value: '0.75rem', px: '12' },
    { label: 'xl', value: '1rem', px: '16' },
  ];

  tableData = [
    {
      id: 'INV-4401',
      client: 'Acme Logistics',
      amount: '$1,250.00',
      status: 'Paid',
      date: '2024-03-01',
    },
    {
      id: 'INV-4402',
      client: 'Global Systems',
      amount: '$4,200.50',
      status: 'Pending',
      date: '2024-03-02',
    },
    {
      id: 'INV-4403',
      client: 'Alpha Corp',
      amount: '$920.00',
      status: 'Overdue',
      date: '2024-02-28',
    },
    {
      id: 'INV-4404',
      client: 'Zion Tech',
      amount: '$15,000.00',
      status: 'Processing',
      date: '2024-03-04',
    },
  ];
}
