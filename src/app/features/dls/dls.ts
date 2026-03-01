import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dls.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class DlsComponent {
  brandColors = [
    { name: 'Blue 50', hex: '#eff6ff' },
    { name: 'Blue 100', hex: '#dbeafe' },
    { name: 'Blue 500', hex: '#3b82f6' },
    { name: 'Blue 600', hex: '#2563eb' },
    { name: 'Blue 700', hex: '#1d4ed8' },
  ];

  neutralColors = [
    { name: 'Slate 50', hex: '#f8fafc' },
    { name: 'Slate 100', hex: '#f1f5f9' },
    { name: 'Slate 200', hex: '#e2e8f0' },
    { name: 'Slate 500', hex: '#64748b' },
    { name: 'Slate 900', hex: '#0f172a' },
  ];

  semanticColors = [
    { name: 'Success', hex: '#10b981' },
    { name: 'Warning', hex: '#f59e0b' },
    { name: 'Danger', hex: '#ef4444' },
    { name: 'Info', hex: '#3b82f6' },
  ];

  spacing = [
    { label: 'space-xs', value: '0.25rem', px: '4px' },
    { label: 'space-sm', value: '0.5rem', px: '8px' },
    { label: 'space-md', value: '1rem', px: '16px' },
    { label: 'space-lg', value: '1.5rem', px: '24px' },
    { label: 'space-xl', value: '2rem', px: '32px' },
    { label: 'space-2xl', value: '3rem', px: '48px' },
  ];
}
