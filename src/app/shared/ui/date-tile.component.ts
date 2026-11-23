import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Data a forma di calendario: mese su fascia colorata, giorno grande, anno (come le card degli eventi di GesFor). */
@Component({
  selector: 'app-date-tile',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (date) {
      <div class="date-tile" [class]="'date-tile date-tile-' + variant" [attr.aria-label]="date | date:'dd/MM/yyyy'">
        <div class="date-tile-month">{{ date | date:'MMM':undefined:locale }}</div>
        <div class="date-tile-day">{{ date | date:'dd' }}</div>
        <div class="date-tile-year">{{ date | date:'yyyy' }}</div>
      </div>
    }
  `,
  styles: [`
    :host { display: inline-block; }
    .date-tile { width: 4.5rem; text-align: center; background: #fff; border-radius: 8px; overflow: hidden;
      box-shadow: 0 2px 8px rgba(23, 50, 77, .12), 0 1px 2px rgba(23, 50, 77, .08); }
    .date-tile-month { background: var(--app-primary); color: #fff; font-size: .8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .04em; padding: .25rem 0; }
    .date-tile-day { font-size: 1.9rem; font-weight: 700; line-height: 1.1; color: #17324d; padding-top: .35rem; }
    .date-tile-year { font-size: .8rem; color: #5d7083; padding-bottom: .4rem; }
    .date-tile-success .date-tile-month { background: #008758; }
    .date-tile-danger .date-tile-month { background: #d9364f; }
    .date-tile-warning .date-tile-month { background: #a66300; }
    .date-tile-secondary .date-tile-month { background: #5d7083; }
  `],
})
export class DateTileComponent {
  @Input() date: Date | string;
  /** Colore della fascia del mese: primary (default), success, danger, warning, secondary. */
  @Input() variant: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' = 'primary';
  @Input() locale = 'it-IT';
}
