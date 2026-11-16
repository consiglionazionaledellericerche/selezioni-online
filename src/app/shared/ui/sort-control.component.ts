import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface SortOption {
  value: string;
  label: string;
}

/**
 * Ordinamento di un elenco: campo (select) e direzione (pulsante crescente/decrescente),
 * collegati ai controlli orderBy e orderDirection del form dei filtri.
 */
@Component({
  selector: 'app-sort-control',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  styles: [`
    .sort-inline-label { position: static !important; transform: none !important; font-size: .9rem; font-weight: 600; color: #5d7083; white-space: nowrap; padding: 0; }
    .sort-inline-select select { min-width: 12rem; height: 2.25rem; padding-top: 0; padding-bottom: 0; font-size: .95rem; }
  `],
  template: `
    <div [formGroup]="form" class="d-flex gap-2" [class.align-items-end]="!inline" [class.align-items-center]="inline">
      @if (inline) {
        <label [for]="id" class="sort-inline-label mb-0">{{ 'layout.sort_by' | translate }}</label>
      }
      <div class="select-wrapper mb-0" [class.flex-grow-1]="!inline" [class.sort-inline-select]="inline">
        @if (!inline) {
          <label [for]="id">{{ 'layout.sort_by' | translate }}</label>
        }
        <select [id]="id" formControlName="orderBy">
          @for (option of options; track option.value) {
            <option [value]="option.value">{{ option.label | translate }}</option>
          }
        </select>
      </div>
      <button type="button" class="btn btn-outline-primary btn-sm btn-action" [class.mb-1]="!inline" (click)="toggle()"
              [attr.aria-label]="(isAsc() ? 'layout.sort_asc' : 'layout.sort_desc') | translate"
              [title]="(isAsc() ? 'layout.sort_asc' : 'layout.sort_desc') | translate">
        <svg class="icon icon-sm icon-primary"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + (isAsc() ? 'it-arrow-up' : 'it-arrow-down')"></use></svg>
      </button>
    </div>
  `,
})
export class SortControlComponent {
  private static seq = 0;
  @Input() form: FormGroup;
  @Input() options: SortOption[] = [];
  /** Variante compatta su una riga ("Ordina per [campo] ↓"), per la barra sopra i risultati. */
  @Input() inline = false;
  readonly id = 'sort-' + (++SortControlComponent.seq);

  isAsc(): boolean {
    return this.form?.value?.orderDirection === 'asc';
  }

  toggle(): void {
    this.form.controls['orderDirection'].setValue(this.isAsc() ? 'desc' : 'asc');
  }
}
