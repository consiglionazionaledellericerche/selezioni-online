import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, forwardRef, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ConfigService } from '../../core/config.service';

export interface AutocompleteItem {
  id: string;
  title: string;
  subtitle?: string;
}

/**
 * Campo con ricerca remota e suggerimenti (markup autocomplete di Bootstrap Italia), collegabile a un form.
 * Sostituisce le select2 con ricerca ajax: la chiamata passa da HttpClient, quindi dagli interceptor
 * di autenticazione come tutte le altre richieste dell'applicazione.
 * Il valore del controllo è l'identificativo dell'elemento scelto (resultId).
 */
@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [TranslatePipe],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteComponent), multi: true }],
  template: `
    <div class="form-group mb-0 position-relative">
      @if (label) {
        <label [for]="inputId" class="active">{{ label | translate }}</label>
      }
      <input type="search" class="form-control autocomplete" [id]="inputId" autocomplete="off"
             [placeholder]="placeholder | translate" [value]="text" [disabled]="disabled"
             role="combobox" [attr.aria-expanded]="open" [attr.aria-controls]="listId" aria-autocomplete="list"
             [attr.aria-activedescendant]="open && active >= 0 ? listId + '-' + active : null"
             (input)="onInput($any($event.target).value)" (focus)="open = items.length > 0"
             (keydown.arrowDown)="move(1, $event)" (keydown.arrowUp)="move(-1, $event)"
             (keydown.enter)="enter($event)" (keydown.escape)="open = false">
      <span class="autocomplete-icon" aria-hidden="true">
        <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-search"></use></svg>
      </span>
      @if (value) {
        <button type="button" class="btn btn-link p-0 clear-btn" (click)="clear()" [attr.aria-label]="'layout.clear' | translate">
          <svg class="icon icon-sm icon-secondary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      }
      @if (open) {
        <ul class="autocomplete-list autocomplete-list-show" [id]="listId" role="listbox">
          @if (loading) {
            <li class="px-3 py-2 small text-secondary">{{ 'layout.loading' | translate }}</li>
          } @else if (error) {
            <li class="px-3 py-2 small text-danger">{{ 'layout.search_error' | translate }}</li>
          } @else if (!items.length) {
            <li class="px-3 py-2 small text-secondary">{{ 'layout.no_results' | translate }}</li>
          }
          @for (item of items; track item.id; let i = $index) {
            <li role="option" [id]="listId + '-' + i" [attr.aria-selected]="i === active">
              <a href="javascript:void(0)" tabindex="-1" class="ac-item" [class.ac-active]="i === active"
                 (mousedown)="$event.preventDefault()" (mouseenter)="active = i" (click)="choose(item)">
                <span class="autocomplete-list-text">
                  <span>{{ item.title }}</span>
                  @if (item.subtitle) { <em>{{ item.subtitle }}</em> }
                </span>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .clear-btn { position: absolute; right: 2.25rem; bottom: .7rem; }
    .autocomplete-list { position: absolute; left: 0; right: 0; z-index: 20; max-height: 18rem; overflow: auto; }
    .autocomplete-list em { display: block; font-size: .85rem; font-style: normal; color: #5d7083;
      text-transform: none !important; letter-spacing: normal !important; }
    .autocomplete-list .ac-item { display: block; border-left: 3px solid transparent; }
    .autocomplete-list .ac-item.ac-active { background: #e6f0fa !important; border-left-color: #0066cc; }
    .autocomplete-list .ac-item.ac-active .autocomplete-list-text span { color: #0066cc; }
  `],
})
export class AutocompleteComponent implements ControlValueAccessor, OnDestroy {
  private static seq = 0;
  /** Percorso relativo al gateway (es. '/openapi/v1/call/select2'); il termine va nel parametro 'filter'. */
  @Input() path: string;
  /** Proprietà della risposta che contiene l'elenco (es. 'items', 'people'). */
  @Input() resultName = 'items';
  /** Proprietà di ogni elemento usata come valore del controllo. */
  @Input() resultId = 'id';
  /** Converte un elemento della risposta in titolo/sottotitolo da mostrare. */
  @Input() display: (item: any) => { title: string, subtitle?: string } = item => ({ title: String(item[this.resultId]) });
  @Input() placeholder = '';
  @Input() label: string;
  @Input() minLength = 2;
  /** Elemento scelto, completo (es. per compilare altri campi con nome ed email). */
  @Output() selected = new EventEmitter<any>();
  /** Testo da mostrare per il valore iniziale (es. il codice del bando quando il valore è il suo id). */
  @Input() set displayText(text: string) {
    this._displayText = text;
    if (text && this.value) {
      this.text = text;
    }
  }
  private _displayText: string;

  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly host = inject(ElementRef);
  private readonly terms = new Subject<string>();
  private readonly subscription: Subscription;

  readonly inputId = 'ac-' + (++AutocompleteComponent.seq);
  readonly listId = this.inputId + '-list';
  value: string = null;
  text = '';
  items: AutocompleteItem[] = [];
  open = false;
  loading = false;
  error = false;
  active = -1;
  disabled = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.subscription = this.terms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(term => {
        this.error = false;
        this.loading = term.length >= this.minLength;
        this.open = this.loading;
        if (!this.loading) {
          this.items = [];
        }
      }),
      switchMap(term => term.length < this.minLength ? of([]) : this.configService.getGateway().pipe(
        switchMap(gateway => this.http.get<any>(gateway + this.path, { params: new HttpParams().set('filter', term) })),
        map(result => (result && result[this.resultName] || []).map(item => ({ id: item[this.resultId], ...this.display(item), raw: item }))),
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

  onInput(text: string): void {
    this.text = text;
    if (this.value) {
      this.value = null;
      this.onChange(null);
    }
    this.terms.next(text.trim());
  }

  choose(item: AutocompleteItem): void {
    this.value = item.id;
    this.text = item.title;
    this.open = false;
    this.onChange(item.id);
    this.onTouched();
    this.selected.emit((item as any).raw || item);
  }

  clear(): void {
    this.value = null;
    this.text = '';
    this.items = [];
    this.open = false;
    this.onChange(null);
    this.terms.next('');
  }

  move(delta: number, event: Event): void {
    if (!this.items.length) {
      return;
    }
    event.preventDefault();
    this.open = true;
    this.active = (this.active + delta + this.items.length) % this.items.length;
    // l'elemento attivo resta visibile negli elenchi lunghi
    setTimeout(() => {
      const element = this.host.nativeElement.querySelector('#' + this.listId + '-' + this.active);
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  enter(event: Event): void {
    if (this.open && this.active >= 0 && this.items[this.active]) {
      event.preventDefault();
      this.choose(this.items[this.active]);
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
    if (!value) {
      this.text = '';
    } else if (!this.text) {
      this.text = this._displayText || value;
    }
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
