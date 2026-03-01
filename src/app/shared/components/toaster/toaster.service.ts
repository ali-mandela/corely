import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToasterService {
  private _toasts = signal<Toast[]>([]);
  private counter = 0;

  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, duration };

    this._toasts.update((list) => [...list, toast]);

    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }
  error(message: string): void {
    this.show(message, 'error', 6000);
  }
  warning(message: string): void {
    this.show(message, 'warning', 5000);
  }
  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
