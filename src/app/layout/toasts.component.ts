import { Component, inject } from '@angular/core';
import { NotifyService, ToastType } from './notify.service';

/** Pila di notifiche in basso a destra (stile in styles.scss, "notifiche"). */
@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="app-toasts" aria-live="polite" aria-atomic="false">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="app-toast" [class]="'app-toast app-toast-' + toast.type"
             [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
             (mouseenter)="notify.pause(toast.id)" (mouseleave)="notify.resume(toast.id)">
          <svg class="icon app-toast-icon" aria-hidden="true"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + icon(toast.type)"></use></svg>
          <div class="app-toast-body">
            <div class="app-toast-title" [innerHTML]="toast.title"></div>
            @if (toast.message) {
              <div class="app-toast-message" [innerHTML]="toast.message"></div>
            }
          </div>
          <button type="button" class="app-toast-close" (click)="notify.dismiss(toast.id)" aria-label="Chiudi">
            <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  readonly notify = inject(NotifyService);

  icon(type: ToastType): string {
    return { success: 'it-check-circle', info: 'it-info-circle', warning: 'it-warning-circle', error: 'it-error' }[type];
  }
}
