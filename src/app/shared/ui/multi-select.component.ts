import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface MultiSelectOption {
  value: string;
  label: string;
}

/**
 * Selezione multipla in stile Bootstrap Italia: le voci scelte sono etichette (chip) rimovibili;
 * "Aggiungi" apre un pannello con ricerca e caselle di spunta. Sostituisce select2 in modalità multipla.
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="ms-box" [class.is-invalid]="invalid" [class.disabled]="disabled">
      <div class="ms-chips">
        @for (option of selectedOptions(); track option.value) {
          <span class="chip chip-simple chip-primary ms-chip">
            <span class="chip-label">{{ option.label | translate }}</span>
            @if (!disabled) {
              <button type="button" (click)="remove(option.value)" [attr.aria-label]="('layout.remove' | translate) + ' ' + (option.label | translate)">
                <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
              </button>
            }
          </span>
        } @empty {
          <span class="ms-empty">{{ (placeholder || 'layout.none_selected') | translate }}</span>
        }
      </div>
      @if (!disabled) {
        <button type="button" class="btn btn-outline-primary btn-xs ms-toggle" (click)="toggle()" [attr.aria-expanded]="open">
          <svg class="icon icon-primary icon-xs me-1"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + (open ? 'it-collapse' : 'it-plus')"></use></svg>
          {{ (open ? 'layout.close' : 'layout.add') | translate }}
        </button>
      }
    </div>
    @if (open) {
      <div class="ms-panel shadow" role="listbox" aria-multiselectable="true">
        <div class="ms-panel-head">
          <input type="search" class="ms-filter" [placeholder]="'layout.filter' | translate"
                 [value]="filter" (input)="filter = $any($event.target).value" (keydown.escape)="open = false">
          <div class="d-flex justify-content-between small mt-2">
            <span class="text-secondary">{{ values?.length || 0 }} / {{ options?.length || 0 }}</span>
            <span>
              <a href="javascript:void(0)" (click)="selectAll(true)">{{ 'layout.select_all' | translate }}</a>
              <span class="mx-1 text-secondary">·</span>
              <a href="javascript:void(0)" (click)="selectAll(false)">{{ 'layout.select_none' | translate }}</a>
            </span>
          </div>
        </div>
        <ul class="ms-list list-unstyled mb-0">
          @for (option of filtered(); track option.value) {
            <li>
<div class="ms-option" role="option" tabindex="0" [class.checked]="isSelected(option.value)"
                   [attr.aria-selected]="isSelected(option.value)"
                   (click)="toggleValue(option.value)" (keydown.space)="$event.preventDefault(); toggleValue(option.value)"
                   (keydown.enter)="$event.preventDefault(); toggleValue(option.value)">
                <input type="checkbox" class="native-check" tabindex="-1" aria-hidden="true" [checked]="isSelected(option.value)">
                <span>{{ option.label | translate }}</span>
              </div>
            </li>
          } @empty {
            <li class="small text-secondary px-2 py-1">{{ 'layout.no_results' | translate }}</li>
          }
        </ul>
      </div>
    }
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ms-box { display: flex; align-items: flex-start; gap: .5rem; min-height: 2.5rem; padding: .35rem 0; border-bottom: 1px solid #5d7083; }
    .ms-box.is-invalid { border-bottom-color: #d9364f; }
    .ms-chips { display: flex; flex-wrap: wrap; gap: .35rem; flex: 1; min-width: 0; }
    .ms-chip { margin: 0; max-width: 100%; }
    .ms-chip .chip-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ms-empty { color: #5d7083; font-size: .95rem; padding-top: .2rem; }
    .ms-toggle { flex-shrink: 0; white-space: nowrap; }
    .ms-panel { position: absolute; left: 0; right: 0; z-index: 30; background: #fff; border: 1px solid #d9dadb; border-radius: 4px; margin-top: .25rem; }
    .ms-panel-head { padding: .75rem; border-bottom: 1px solid #e3e8ee; }
    .ms-filter { display: block; width: 100%; height: 2.25rem; padding: .25rem .5rem; border: 1px solid #d9dadb; border-radius: 4px; font-size: .95rem; }
    .ms-filter:focus { outline: 2px solid #0066cc; outline-offset: 0; border-color: #0066cc; }
    .ms-list { max-height: 18rem; overflow: auto; padding: .25rem 0; }
    .ms-option { position: static; display: flex; align-items: center; gap: .6rem; padding: .4rem .75rem; margin: 0; cursor: pointer; font-size: .95rem; color: #17324d; }
    .ms-option:hover { background: #f0f6fc; }
    .ms-option.checked { font-weight: 600; }
    .ms-option:focus { outline: 2px solid #0066cc; outline-offset: -2px; }
    .native-check { pointer-events: none; position: static !important; opacity: 1 !important; left: auto !important; width: 1.1rem; height: 1.1rem; margin: 0;
      flex-shrink: 0; accent-color: var(--bs-primary, #0066cc); }
  `],
})
export class MultiSelectComponent implements OnChanges {
  @Input() options: MultiSelectOption[] = [];
  @Input() values: string[] = [];
  @Input() placeholder: string;
  @Input() invalid = false;
  @Input() disabled = false;
  @Output() valuesChange = new EventEmitter<string[]>();

  private readonly host = inject(ElementRef);
  private readonly translate = inject(TranslateService);
  open = false;
  filter = '';
  private byValue = new Map<string, MultiSelectOption>();

  ngOnChanges(): void {
    this.byValue = new Map((this.options || []).map(o => [o.value, o]));
  }

  selectedOptions(): MultiSelectOption[] {
    return (this.values || []).map(v => this.byValue.get(v) || { value: v, label: v });
  }

  isSelected(value: string): boolean {
    return (this.values || []).includes(value);
  }

  filtered(): MultiSelectOption[] {
    const term = this.filter.trim().toLowerCase();
    return (this.options || []).filter(o => !term ||
      String(this.translate.instant(o.label || '')).toLowerCase().includes(term) || o.value.toLowerCase().includes(term));
  }

  toggle(): void {
    this.open = !this.open;
    this.filter = '';
  }

  toggleValue(value: string): void {
    this.emit(this.isSelected(value) ? this.values.filter(v => v !== value) : [...(this.values || []), value]);
  }

  remove(value: string): void {
    this.emit((this.values || []).filter(v => v !== value));
  }

  selectAll(all: boolean): void {
    const visible = this.filtered().map(o => o.value);
    const current = this.values || [];
    this.emit(all ? Array.from(new Set([...current, ...visible])) : current.filter(v => !visible.includes(v)));
  }

  private emit(values: string[]): void {
    this.values = values;
    this.valuesChange.emit(values);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }
}
