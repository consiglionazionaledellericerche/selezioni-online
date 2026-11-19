import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ComuneTerritorio, TerritoriService } from './territori.service';

/**
 * Comune italiano dall'archivio ANPR, con ricerca per nome o codice catastale. Con [attivi] solo i comuni in
 * vigore (residenza, recapiti); altrimenti anche i soppressi, evidenziati (luogo di nascita), eventualmente
 * limitati a quelli validi alla [data] indicata.
 * Il valore del controllo è il comune scelto ({ id: nome, provincia, ... }); salvato come nome del comune.
 */
@Component({
  selector: 'app-control-comune',
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
             (input)="onInput($any($event.target).value)" (focus)="open = items.length > 0" (blur)="onBlur()"
             (keydown.arrowDown)="move(1, $event)" (keydown.arrowUp)="move(-1, $event)"
             (keydown.enter)="enter($event)" (keydown.escape)="open = false">
      <span class="autocomplete-icon" aria-hidden="true">
        <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-search"></use></svg>
      </span>
      @if (open) {
        <ul class="autocomplete-list autocomplete-list-show" [id]="listId" role="listbox">
          @if (loading) {
            <li class="px-3 py-2 small text-secondary">{{ 'layout.loading' | translate }}</li>
          } @else if (error) {
            <li class="px-3 py-2 small text-danger">{{ 'layout.search_error' | translate }}</li>
          } @else if (!items.length) {
            <li class="px-3 py-2 small text-secondary">{{ 'layout.no_results' | translate }}</li>
          }
          @for (item of items; track $index; let i = $index) {
            <li role="option" [attr.aria-selected]="i === active">
              <a href="javascript:void(0)" [class.focus--mouse]="i === active" (mousedown)="$event.preventDefault()" (click)="choose(item)">
                <span class="autocomplete-list-text">
                  <span>
                    {{ item.nomeComune }}
                    @if (item.provincia) { <span class="text-secondary">({{ item.provincia }})</span> }
                    @if (item.dataCessazione) {
                      <span class="badge bg-secondary ms-1">{{ 'territori.soppresso' | translate:{ anno: item.dataCessazione.substring(0, 4) } }}</span>
                    }
                  </span>
                  <em>{{ detail(item) }}</em>
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
    .autocomplete-list { position: absolute; left: 0; right: 0; z-index: 30; max-height: 20rem; overflow: auto; }
    .autocomplete-list em { display: block; font-size: .85rem; font-style: normal; color: #5d7083; }
  `]
})
export class ComuneSelectComponent implements ControlValueAccessor, OnDestroy {
  private static seq = 0;
  @Input() label: string;
  @Input() placeholder = '';
  @Input() required = false;
  /** Solo comuni in vigore. */
  @Input() attivi = false;
  /** Solo comuni validi in questa data (yyyy-MM-dd o Date), es. la data di nascita. */
  @Input() data: string | Date;
  /** Comune scelto (con provincia, codici e validità), null quando viene svuotato. */
  @Output() changed = new EventEmitter<ComuneTerritorio>();

  readonly inputId = 'comune-' + (++ComuneSelectComponent.seq);
  readonly listId = this.inputId + '-list';
  value: ComuneTerritorio = null;
  text = '';
  items: ComuneTerritorio[] = [];
  open = false;
  loading = false;
  error = false;
  active = -1;
  disabled = false;

  private readonly territori = inject(TerritoriService);
  private readonly host = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly terms = new Subject<string>();
  private readonly subscription: Subscription;
  private onChange: (value: ComuneTerritorio) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.subscription = this.terms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        this.error = false;
        this.loading = term.length >= 2;
        this.open = this.loading;
        if (!this.loading) {
          this.items = [];
        }
      }),
      switchMap(term => term.length < 2 ? of([]) : this.territori.comuni(term, this.attivi, this.isoData()).pipe(
        catchError(() => {
          this.error = true;
          return of([]);
        })
      ))
    ).subscribe(items => {
      this.items = items;
      this.loading = false;
      this.active = -1;
    });
  }

  invalid(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  detail(item: ComuneTerritorio): string {
    const parts: string[] = [];
    if (item.dataCessazione) {
      parts.push((item.dataIstituzione ? this.date(item.dataIstituzione) + ' – ' : 'fino al ') + this.date(item.dataCessazione));
    }
    if (item.codiceCatastale) {
      parts.push(item.codiceCatastale);
    }
    return parts.join(' · ');
  }

  onInput(text: string): void {
    this.text = text;
    if (this.value) {
      this.set(null, false);
    }
    this.terms.next(text.trim());
  }

  onBlur(): void {
    this.onTouched();
    if (!this.value) {
      // testo non scelto dall'elenco: si accetta solo se coincide con il primo risultato
      const first = this.items[0];
      if (first && this.text.trim().toLowerCase() === first.nomeComune.toLowerCase()) {
        this.choose(first);
      } else if (!this.open) {
        this.text = '';
      }
    }
  }

  choose(item: ComuneTerritorio): void {
    this.set(item, true);
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
      if (!this.value) {
        this.text = '';
      }
    }
  }

  /** Accetta il comune ({ id/nomeComune, provincia }) o solo il nome, come nei dati già salvati. */
  writeValue(value: any): void {
    if (!value) {
      this.value = null;
      this.text = '';
      return;
    }
    const nome = typeof value === 'string' ? value : (value.nomeComune || value.id || '');
    this.value = typeof value === 'string' ? { id: value, nomeComune: value, provincia: null } : { ...value, id: nome, nomeComune: nome };
    this.text = this.label$(this.value);
  }

  registerOnChange(fn: (value: ComuneTerritorio) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private set(item: ComuneTerritorio, updateText: boolean): void {
    this.value = item ? { ...item, id: item.nomeComune } : null;
    if (updateText) {
      this.text = this.value ? this.label$(this.value) : '';
    }
    this.onChange(this.value);
    this.changed.emit(this.value);
  }

  private label$(item: ComuneTerritorio): string {
    return item.provincia ? item.nomeComune + ' (' + item.provincia + ')' : item.nomeComune;
  }

  private isoData(): string {
    if (!this.data) {
      return null;
    }
    const date = this.data instanceof Date ? this.data : new Date(this.data);
    if (isNaN(date.getTime())) {
      return null;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  private date(iso: string): string {
    return iso && iso.length >= 10 ? iso.substring(8, 10) + '/' + iso.substring(5, 7) + '/' + iso.substring(0, 4) : iso;
  }
}
