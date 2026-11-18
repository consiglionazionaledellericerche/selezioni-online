import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  /** Testo o HTML (viene sanificato da Angular alla visualizzazione). */
  message?: string;
  duration: number;
}

/**
 * Notifiche in basso a destra (app-toasts): titolo e messaggio, anche HTML (es. elenco dei campi da correggere).
 * Se il titolo è vuoto il messaggio diventa il titolo.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;
  private timers = new Map<number, any>();

  success(message: string, title = 'Operazione completata'): void {
    this.push('success', title, message, 6000);
  }

  info(message: string, title = 'Informazione'): void {
    this.push('info', title, message, 7000);
  }

  warning(message: string, title = 'Attenzione'): void {
    this.push('warning', title, message, 9000);
  }

  error(message: string, title = 'Errore'): void {
    this.push('error', title, message, 15000);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Sospende la chiusura automatica (es. mouse sopra la notifica). */
  pause(id: number): void {
    this.clearTimer(id);
  }

  resume(id: number): void {
    const toast = this.toasts().find(t => t.id === id);
    if (toast) {
      this.schedule(toast, Math.min(toast.duration, 4000));
    }
  }

  private push(type: ToastType, title: string, message: string, duration: number): void {
    const [t, m] = title && title.trim() ? [title, message] : [message, undefined];
    const toast: Toast = { id: ++this.seq, type, title: t, message: m, duration };
    // al massimo 4 notifiche visibili: le più vecchie lasciano il posto
    this.toasts.update(list => [...list.slice(-3), toast]);
    this.schedule(toast, duration);
  }

  private schedule(toast: Toast, duration: number): void {
    this.clearTimer(toast.id);
    this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), duration));
  }

  private clearTimer(id: number): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
  }
}
