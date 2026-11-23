import { Component, Input, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface SegmentedOption {
  value: string;
  label: string;
}

/**
 * Gruppo di pulsanti a scelta singola (stile Bootstrap Italia) collegabile a un form con formControlName.
 * Sostituisce btnRadioGroup/btnRadio di ngx-bootstrap. Con [vertical]="true" diventa un elenco verticale.
 */
@Component({
  selector: 'app-segmented',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SegmentedComponent), multi: true }],
  template: `
    @if (vertical) {
      <ul class="segmented-list list-unstyled mb-0" role="radiogroup" [attr.aria-label]="label">
        @for (option of options; track option.value) {
          <li>
            <button type="button" role="radio" [attr.aria-checked]="value === option.value" [disabled]="disabled"
                    [class.active]="value === option.value" (click)="select(option.value)">{{ option.label | translate }}</button>
          </li>
        }
      </ul>
    } @else {
      <div class="btn-group w-100" role="radiogroup" [attr.aria-label]="label">
        @for (option of options; track option.value) {
          <button type="button" class="btn btn-sm flex-fill px-1 text-truncate" role="radio"
                  [attr.aria-checked]="value === option.value" [disabled]="disabled"
                  [ngClass]="value === option.value ? 'btn-primary' : 'btn-outline-primary'"
                  (click)="select(option.value)">{{ option.label | translate }}</button>
        }
      </div>
    }
  `,
  styles: [`
    .segmented-list button { display: block; width: 100%; text-align: left; border: 0; background: none; padding: .35rem .5rem;
      border-radius: 4px; color: #17324d; font-size: .95rem; }
    .segmented-list button:hover { background: #f0f6fc; }
    .segmented-list button.active { background: var(--app-primary); color: #fff; font-weight: 600; }
  `],
})
export class SegmentedComponent implements ControlValueAccessor {
  @Input() options: SegmentedOption[] = [];
  @Input() vertical = false;
  @Input() label = '';
  value: string = null;
  disabled = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  select(value: string): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
