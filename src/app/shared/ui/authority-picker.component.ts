import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AutocompleteComponent } from './autocomplete.component';

/**
 * Scelta di un utente o di un gruppo con autocompletamento (GET /openapi/v1/user/authorities), come il widget
 * legacy cnr.ui.authority. Il valore è lo username o il nome del gruppo (GROUP_...).
 * mode: 'users' (solo utenti), 'groups' (solo gruppi) o 'both' (scelta Utente / Gruppo sopra il campo).
 */
@Component({
  selector: 'app-authority-picker',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, AutocompleteComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AuthorityPickerComponent), multi: true }],
  template: `
    <div class="authority-picker">
      @if (mode === 'both') {
        <div class="authority-kind" role="radiogroup" [attr.aria-label]="'authority.kind' | translate">
          <button type="button" class="kind-option" [class.active]="kind === 'users'" role="radio" [attr.aria-checked]="kind === 'users'"
                  (click)="setKind('users')">
            <svg class="icon icon-xs" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-user"></use></svg>
            {{ 'authority.user' | translate }}
          </button>
          <button type="button" class="kind-option" [class.active]="kind === 'groups'" role="radio" [attr.aria-checked]="kind === 'groups'"
                  (click)="setKind('groups')">
            <svg class="icon icon-xs" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pa"></use></svg>
            {{ 'authority.group' | translate }}
          </button>
        </div>
      }
      @if (renderKey) {
        <app-autocomplete [path]="path()" resultName="items" resultId="id" [display]="display" [minLength]="2"
          [label]="label || (kind === 'groups' ? 'authority.group_label' : 'authority.user_label')"
          [placeholder]="kind === 'groups' ? 'authority.search_group' : 'authority.search_user'"
          [formControl]="inner" (selected)="selected.emit($event)"></app-autocomplete>
      }
    </div>
  `,
  styles: [`
    .authority-kind { display: inline-flex; gap: .25rem; padding: .2rem; margin-bottom: 1.6rem; border-radius: 6px; background: #eef1f4; }
    .kind-option { display: inline-flex; align-items: center; gap: .35rem; padding: .3rem .8rem; border: 0; border-radius: 4px;
      background: transparent; font-size: .85rem; font-weight: 600; color: #5d7083; }
    .kind-option .icon { fill: currentColor; }
    .kind-option.active { background: #fff; color: #0066cc; box-shadow: 0 1px 3px rgba(23, 50, 77, .15); }
  `]
})
export class AuthorityPickerComponent implements ControlValueAccessor, OnChanges {
  @Input() mode: 'users' | 'groups' | 'both' = 'users';
  @Input() label: string;
  /** Elemento scelto completo (id, title, subtitle, kind; per gli utenti anche firstName, lastName, email). */
  @Output() selected = new EventEmitter<any>();

  public inner = new FormControl<string>(null);
  public kind: 'users' | 'groups' = 'users';
  /** Ricrea il campo al cambio di tipo, così testo e suggerimenti ripartono da zero. */
  public renderKey = true;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.inner.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }

  ngOnInit(): void {
    this.kind = this.mode === 'groups' ? 'groups' : 'users';
  }

  /** Cambio di modalità dall'esterno (es. tipo user/group nelle regole RBAC): campo azzerato sul nuovo tipo. */
  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['mode'];
    if (change && !change.firstChange && this.mode !== 'both') {
      this.setKind(this.mode);
    }
  }

  public display = (item: any) => ({ title: item.title || item.id, subtitle: item.subtitle });

  path(): string {
    return '/openapi/v1/user/authorities?type=' + this.kind;
  }

  setKind(kind: 'users' | 'groups'): void {
    if (this.kind === kind) {
      return;
    }
    this.kind = kind;
    this.inner.setValue(null);
    this.renderKey = false;
    setTimeout(() => this.renderKey = true);
  }

  writeValue(value: string): void {
    this.inner.setValue(value || null, { emitEvent: false });
    if (value && this.mode === 'both') {
      this.kind = String(value).startsWith('GROUP_') ? 'groups' : 'users';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    disabled ? this.inner.disable({ emitEvent: false }) : this.inner.enable({ emitEvent: false });
  }
}
