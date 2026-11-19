import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { StatoTerritorio, TerritoriService, flag, normalize } from './territori.service';

interface NazioneItem {
  nome: string;
  subtitle: string;
  flag: string;
  key: string;
}

/**
 * Nazione dall'elenco ufficiale ISTAT degli stati e territori esteri (Italia per prima), con ricerca per nome
 * italiano o inglese e codice ISO. Il valore del controllo è il nome in italiano, come nei dati già salvati.
 */
@Component({
  selector: 'app-control-nazione',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="form-group mb-0 position-relative territorio">
      @if (label) {
        <label [for]="inputId" class="active">{{ label }}{{ required ? ' *' : '' }}</label>
      }
      <input type="search" class="form-control autocomplete" [class.is-invalid]="invalid()" [id]="inputId" autocomplete="off"
             [placeholder]="placeholder" [value]="text" [disabled]="disabled"
             role="combobox" [attr.aria-expanded]="open" [attr.aria-controls]="listId" aria-autocomplete="list"
             [attr.aria-invalid]="invalid()"
             (input)="onInput($any($event.target).value)" (focus)="onFocus()" (blur)="onBlur()"
             (keydown.arrowDown)="move(1, $event)" (keydown.arrowUp)="move(-1, $event)"
             (keydown.enter)="enter($event)" (keydown.escape)="open = false">
      @if (selectedFlag) {
        <span class="selected-flag" aria-hidden="true">{{ selectedFlag }}</span>
      }
      <span class="autocomplete-icon" aria-hidden="true">
        <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-expand"></use></svg>
      </span>
      @if (open) {
        <ul class="autocomplete-list autocomplete-list-show" [id]="listId" role="listbox">
          @if (!items.length) {
            <li class="px-3 py-2 small text-secondary">{{ 'layout.no_results' | translate }}</li>
          }
          @for (item of items; track item.key; let i = $index) {
            <li role="option" [attr.aria-selected]="i === active">
              <a href="javascript:void(0)" [class.focus--mouse]="i === active" (mousedown)="$event.preventDefault()" (click)="choose(item)">
                <span class="autocomplete-list-text">
                  <span><span class="me-2" aria-hidden="true">{{ item.flag }}</span>{{ item.nome }}</span>
                  @if (item.subtitle) { <em>{{ item.subtitle }}</em> }
                </span>
              </a>
            </li>
          }
        </ul>
      }
      @if (invalid()) {
        <div class="invalid-feedback d-block">{{ 'message.validation.required' | translate }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .territorio input.form-control { padding-right: 2.5rem; }
    .selected-flag { position: absolute; right: 2.25rem; bottom: .75rem; font-size: 1.1rem; line-height: 1; pointer-events: none; }
    .autocomplete-list { position: absolute; left: 0; right: 0; z-index: 30; max-height: 18rem; overflow: auto; }
    .autocomplete-list em { display: block; font-size: .85rem; font-style: normal; color: #5d7083; }
  `]
})
export class NazioneSelectComponent implements ControlValueAccessor, OnInit {
  private static seq = 0;
  @Input() label: string;
  @Input() placeholder = '';
  /** Mostra l'asterisco (l'obbligatorietà vera è nei validatori del controllo). */
  @Input() required = false;
  /** Nazione scelta (nome), anche quando viene svuotata (null). */
  @Output() changed = new EventEmitter<string>();

  readonly inputId = 'nazione-' + (++NazioneSelectComponent.seq);
  readonly listId = this.inputId + '-list';
  value: string = null;
  text = '';
  selectedFlag = '';
  items: NazioneItem[] = [];
  open = false;
  active = -1;
  disabled = false;

  private all: NazioneItem[] = [];
  private readonly territori = inject(TerritoriService);
  private readonly host = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.territori.stati().subscribe(stati => {
      this.all = stati.map((s: StatoTerritorio) => ({
        nome: s.nome,
        subtitle: [s.nomeEn && s.nomeEn !== s.nome ? s.nomeEn : null, s.iso3].filter(Boolean).join(' · '),
        flag: flag(s.iso2),
        key: normalize(s.nome)
      }));
      this.refreshFlag();
    });
  }

  invalid(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  onFocus(): void {
    this.filter(this.value ? '' : this.text);
    this.open = true;
  }

  onInput(text: string): void {
    this.text = text;
    this.filter(text);
    this.open = true;
  }

  /** Uscendo dal campo: il testo scritto vale solo se corrisponde a una nazione, altrimenti torna il valore. */
  onBlur(): void {
    this.onTouched();
    const key = normalize(this.text);
    if (!key) {
      if (this.value) {
        this.set(null);
      }
    } else if (key !== normalize(this.value)) {
      const match = this.all.find(item => item.key === key);
      if (match) {
        this.set(match.nome);
      } else {
        this.text = this.value || '';
      }
    }
    this.open = false;
  }

  choose(item: NazioneItem): void {
    this.set(item.nome);
    this.open = false;
  }

  move(delta: number, event: Event): void {
    if (!this.items.length) {
      return;
    }
    event.preventDefault();
    this.open = true;
    this.active = (this.active + delta + this.items.length) % this.items.length;
  }

  enter(event: Event): void {
    if (this.open && this.items.length) {
      event.preventDefault();
      this.choose(this.items[this.active >= 0 ? this.active : 0]);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  writeValue(value: string): void {
    this.value = value || null;
    this.text = value || '';
    this.refreshFlag();
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

  private set(value: string): void {
    this.value = value;
    this.text = value || '';
    this.refreshFlag();
    this.onChange(value);
    this.changed.emit(value);
  }

  /** Prima i nomi che iniziano con il testo, poi quelli che lo contengono (anche in inglese o come codice ISO). */
  private filter(text: string): void {
    const key = normalize(text);
    this.active = -1;
    if (!key) {
      this.items = this.all.slice(0, 60);
      return;
    }
    const starts = this.all.filter(item => item.key.startsWith(key) || (' ' + item.key).includes(' ' + key));
    const contains = this.all.filter(item => !starts.includes(item) &&
      (item.key.includes(key) || normalize(item.subtitle).split(' ').includes(key)));
    this.items = starts.concat(contains).slice(0, 60);
  }

  private refreshFlag(): void {
    const item = this.value ? this.all.find(i => i.key === normalize(this.value)) : null;
    this.selectedFlag = item ? item.flag : '';
  }
}
