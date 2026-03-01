import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { ToasterService, Toast } from './toaster.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-3 right-3 z-50 flex flex-col gap-2 w-80">
      <div
        *ngFor="let toast of toaster.toasts()"
        class="flex items-start gap-2 p-3 bg-white border rounded-sm shadow-lg animate-slideIn"
        [ngClass]="{
          'border-emerald-200': toast.type === 'success',
          'border-red-200': toast.type === 'error',
          'border-amber-200': toast.type === 'warning',
          'border-blue-200': toast.type === 'info',
        }"
      >
        <lucide-icon
          [name]="getIcon(toast.type)"
          class="w-4 h-4 flex-shrink-0 mt-0.5"
          [ngClass]="{
            'text-emerald-500': toast.type === 'success',
            'text-red-500': toast.type === 'error',
            'text-amber-500': toast.type === 'warning',
            'text-blue-500': toast.type === 'info',
          }"
        ></lucide-icon>
        <span class="flex-1 text-[12px] text-slate-700 font-medium leading-snug">{{
          toast.message
        }}</span>
        <button
          (click)="toaster.dismiss(toast.id)"
          class="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
        >
          <lucide-icon [name]="X" class="w-3.5 h-3.5"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-slideIn {
        animation: slideIn 0.25s ease-out;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(16px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToasterComponent {
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;
  readonly X = X;

  constructor(public toaster: ToasterService) {}

  getIcon(type: string) {
    switch (type) {
      case 'success':
        return this.CheckCircle;
      case 'error':
        return this.XCircle;
      case 'warning':
        return this.AlertTriangle;
      default:
        return this.Info;
    }
  }
}
