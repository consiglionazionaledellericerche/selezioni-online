import { ContentLinksDirective } from './content-links.directive';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FrontOfficeService, Notice } from './frontoffice.service';

/**
 * Pannello laterale degli avvisi in corso di validità (aperto dal pulsante "Avvisi" dell'header, come il pulsante
 * "N Avvisi" del legacy): titolo, tipologia di bando, data e testo, con il colore dello stile scelto.
 */
@Component({
  selector: 'app-notices-panel',
  standalone: true,
  imports: [TranslatePipe, DatePipe, ContentLinksDirective],
  template: `
    @if (open) {
      <div class="offcanvas-backdrop fade show" (click)="close.emit()"></div>
    }
    <aside class="offcanvas offcanvas-end notices-panel" [class.show]="open" tabindex="-1" role="dialog"
           aria-modal="true" [attr.aria-hidden]="!open" [attr.aria-label]="'notice.title' | translate">
      <div class="offcanvas-header border-bottom">
        <h2 class="h5 mb-0 d-flex align-items-center gap-2 no_toc">
          <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-horn"></use></svg>
          {{ 'notice.title' | translate }}
        </h2>
        <button type="button" class="btn-close" [attr.aria-label]="'layout.close' | translate" (click)="close.emit()">
          <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      </div>
      <div class="offcanvas-body">
        @if (!notices.length) {
          <p class="text-secondary">{{ 'notice.none' | translate }}</p>
        }
        @for (notice of notices; track notice.nodeRef) {
          <article class="notice" [class]="'notice ' + css(notice)">
            <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
              <strong class="notice-title">{{ notice.title || notice.name }}</strong>
              <small class="text-secondary ms-auto">{{ date(notice.dataPubblicazione) | date:'dd/MM/yyyy' }}</small>
            </div>
            @if (notice.type) { <span class="badge rounded-pill bg-light text-dark mb-2">{{ notice.type | translate }}</span> }
            <div class="notice-text" appContentLinks [innerHTML]="notice.text"></div>
          </article>
        }
      </div>
    </aside>
  `,
  styles: [`
    .notices-panel { width: min(460px, 94vw); visibility: hidden; transition: transform .3s ease, visibility .3s; z-index: 1045; }
    .notices-panel.show { visibility: visible; transform: none; }
    .offcanvas-backdrop { z-index: 1044; }
    .notice { border-left: 4px solid #0066cc; background: #f5f9fd; border-radius: 4px; padding: .75rem 1rem; margin-bottom: .75rem; }
    .notice.n-success { border-left-color: #008758; background: #f0f9f5; }
    .notice.n-warning { border-left-color: #cc7a00; background: #fff8ec; }
    .notice.n-error { border-left-color: #d9364f; background: #fdf1f3; }
    .notice-text { white-space: pre-line; font-size: .95rem; }
    .notice-text :last-child { margin-bottom: 0; }
  `]
})
export class NoticesPanelComponent {
  @Input() open = false;
  @Input() notices: Notice[] = [];
  @Output() close = new EventEmitter<void>();

  date(value: string): Date {
    return FrontOfficeService.date(value);
  }

  css(notice: Notice): string {
    return ({ success: 'n-success', warning: 'n-warning', alert: 'n-warning', error: 'n-error' } as any)[notice.noticeStyle] || '';
  }
}
