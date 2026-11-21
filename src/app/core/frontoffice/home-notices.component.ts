import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FrontOfficeService, Notice } from './frontoffice.service';

/**
 * Avvisi in corso di validità nella home, come gli avvisi del legacy: titolo, testo, tipologia di bando e data
 * di pubblicazione, con il colore dello stile scelto (alert, success, error, warning, information).
 */
@Component({
  selector: 'app-home-notices',
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  template: `
    @if (notices.length) {
      <section class="home-notices mt-4" [attr.aria-label]="'notice.title' | translate">
        @for (notice of visible(); track notice.nodeRef) {
          <div class="alert notice" [class]="'alert notice ' + css(notice)" role="status">
            <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
              <strong class="notice-title">{{ notice.title || notice.name }}</strong>
              @if (notice.type) { <span class="badge rounded-pill bg-light text-dark">{{ notice.type | translate }}</span> }
              <small class="text-secondary ms-auto">{{ date(notice.dataPubblicazione) | date:'dd/MM/yyyy' }}</small>
            </div>
            <div class="notice-text" [innerHTML]="notice.text"></div>
          </div>
        }
        @if (notices.length > limit && !expanded) {
          <button type="button" class="btn btn-link btn-sm p-0" (click)="expanded = true">
            {{ 'notice.show_all' | translate:{ value: notices.length } }}
          </button>
        }
      </section>
    }
  `,
  styles: [`
    .notice { border-left-width: 4px; margin-bottom: .75rem; }
    .notice-text { white-space: pre-line; }
    .notice-text :last-child { margin-bottom: 0; }
  `]
})
export class HomeNoticesComponent implements OnInit {
  public notices: Notice[] = [];
  public expanded = false;
  public readonly limit = 3;
  private readonly frontOffice = inject(FrontOfficeService);

  ngOnInit(): void {
    this.frontOffice.notices().subscribe(notices => this.notices = notices);
  }

  visible(): Notice[] {
    return this.expanded ? this.notices : this.notices.slice(0, this.limit);
  }

  date(value: string): Date {
    return FrontOfficeService.date(value);
  }

  css(notice: Notice): string {
    return ({ alert: 'alert-warning', warning: 'alert-warning', error: 'alert-danger', success: 'alert-success',
      information: 'alert-info' } as any)[notice.noticeStyle] || 'alert-info';
  }
}
