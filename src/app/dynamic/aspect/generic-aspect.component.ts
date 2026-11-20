import { padProtocollo } from '../../common/helpers/protocollo';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../../core/cache.service';
import { ConfigService } from '../../core/config.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

interface GenericField {
  name: string;
  property: string;
  /**
   * Visibile solo quando il campo indicato (per nome) ha questo valore: classi legacy "<campo>_true/_false",
   * "<campo>_add-P/_remove-P" (aspect aggiunto o no) oppure "<campo>_<prefisso del valore>".
   */
  showWhen?: { field: string, value: boolean | string };
  /** Controllo locale, non inviato come proprietà (es. aggiunta/rimozione di un aspect). */
  control?: FormControl;
  /** Data con ora (widget ui.datetimepicker o formato con le ore). */
  time?: boolean;
  label: string;
  kind: 'toggle' | 'aspect' | 'segmented' | 'select' | 'textarea' | 'date' | 'text';
  options: { value: string, label: string }[];
  required: boolean;
  /** Numero di protocollo (widget ui.protocollo): completato a 7 cifre all'uscita dal campo. */
  protocollo?: boolean;
  /**
   * Sì/No obbligatorio dei bulkinfo legacy (widget ui.radio): basta rispondere, anche "No".
   * Le caselle (ui.checkbox) e ui.mandatory.radio richiedono invece "Sì".
   */
  yesNo?: boolean;
}

/**
 * Aspect della domanda senza un componente dedicato: la definizione dei campi viene letta dal bulkinfo
 * del tipo (come faceva il frontend legacy, /rest/bulkInfo/view/{tipo}/form/default) insieme ai valori
 * già salvati nella domanda. Ogni campo diventa un controllo del form della sezione, salvato come gli altri aspect.
 */
/** Impaginazione dei campi generici: griglia a due colonne, campi dipendenti rientrati sotto il loro interruttore. */
export const GENERIC_FIELDS_STYLES = `
    .generic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 1.5rem; align-items: start; }
    .generic-field { min-width: 0; }
    .generic-field.wide { grid-column: 1 / -1; }
    .generic-field .form-group { margin-top: 1.75rem; }
    .generic-field .select-wrapper { margin-top: 1rem; }
    .generic-group { margin: .5rem 0; border-radius: 6px; }
    .generic-group.open { padding: .25rem .9rem .9rem; background: #f5f8fb; border: 1px solid #e3e8ee; }
    .generic-group-body { margin-top: -.25rem; }
    @media (max-width: 767.98px) { .generic-grid { grid-template-columns: minmax(0, 1fr); } }
`;

/** Campi del bulkinfo resi come controlli del form (condiviso da aspect e allegati generici). */
export const GENERIC_FIELDS_TEMPLATE = `
        <ng-container *ngFor="let group of groups()">
          <!-- interruttore con i suoi campi dipendenti, in un riquadro visibile solo se attivo -->
          <div *ngIf="group.head" class="generic-group" [class.open]="groupOpen(group)">
            <ng-container *ngFor="let field of [group.head]"><div class="generic-field" [class.wide]="isWide(field)">
            <ng-container [ngSwitch]="field.kind">
              <app-control-toggle *ngSwitchCase="'toggle'" [inline]="true" [label]="fieldLabel(field)" [yesNo]="!!field.yesNo"
                [formControlName]="field.property"></app-control-toggle>
              <app-control-toggle *ngSwitchCase="'aspect'" [inline]="true" [label]="labelOf(field.label)"
                [formControl]="field.control"></app-control-toggle>
              <div *ngSwitchCase="'segmented'">
                <span class="small fw-semibold d-block mb-1">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></span>
                <app-segmented [options]="field.options" [formControlName]="field.property"></app-segmented>
              </div>
              <div *ngSwitchCase="'select'" class="select-wrapper">
                <label [for]="id(field)">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <select [id]="id(field)" [formControlName]="field.property">
                  <option value=""></option>
                  <option *ngFor="let o of field.options" [value]="o.value">{{ labelOf(o.label) }}</option>
                </select>
              </div>
              <div *ngSwitchCase="'textarea'" class="form-group mb-0">
                <label [for]="id(field)" class="active">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <textarea [id]="id(field)" class="form-control" rows="3" [formControlName]="field.property"></textarea>
              </div>
              <div *ngSwitchCase="'date'" class="form-group mb-0">
                <app-control-datepicker [inline]="true" [time]="!!field.time" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-datepicker>
              </div>
              <div *ngSwitchDefault class="form-group mb-0" (focusout)="padProtocollo(field)">
                <app-control-text type="text" [inline]="true" [labelactive]="true" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-text>
              </div>
            </ng-container>
          </div></ng-container>
            <div class="generic-grid generic-group-body" *ngIf="groupOpen(group)">
              <ng-container *ngFor="let field of group.fields">
                <ng-container *ngIf="isVisible(field)"><div class="generic-field" [class.wide]="isWide(field)">
            <ng-container [ngSwitch]="field.kind">
              <app-control-toggle *ngSwitchCase="'toggle'" [inline]="true" [label]="fieldLabel(field)" [yesNo]="!!field.yesNo"
                [formControlName]="field.property"></app-control-toggle>
              <app-control-toggle *ngSwitchCase="'aspect'" [inline]="true" [label]="labelOf(field.label)"
                [formControl]="field.control"></app-control-toggle>
              <div *ngSwitchCase="'segmented'">
                <span class="small fw-semibold d-block mb-1">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></span>
                <app-segmented [options]="field.options" [formControlName]="field.property"></app-segmented>
              </div>
              <div *ngSwitchCase="'select'" class="select-wrapper">
                <label [for]="id(field)">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <select [id]="id(field)" [formControlName]="field.property">
                  <option value=""></option>
                  <option *ngFor="let o of field.options" [value]="o.value">{{ labelOf(o.label) }}</option>
                </select>
              </div>
              <div *ngSwitchCase="'textarea'" class="form-group mb-0">
                <label [for]="id(field)" class="active">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <textarea [id]="id(field)" class="form-control" rows="3" [formControlName]="field.property"></textarea>
              </div>
              <div *ngSwitchCase="'date'" class="form-group mb-0">
                <app-control-datepicker [inline]="true" [time]="!!field.time" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-datepicker>
              </div>
              <div *ngSwitchDefault class="form-group mb-0" (focusout)="padProtocollo(field)">
                <app-control-text type="text" [inline]="true" [labelactive]="true" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-text>
              </div>
            </ng-container>
          </div></ng-container>
              </ng-container>
            </div>
          </div>
          <!-- campi indipendenti -->
          <div *ngIf="!group.head" class="generic-grid">
            <ng-container *ngFor="let field of group.fields">
              <ng-container *ngIf="isVisible(field)"><div class="generic-field" [class.wide]="isWide(field)">
            <ng-container [ngSwitch]="field.kind">
              <app-control-toggle *ngSwitchCase="'toggle'" [inline]="true" [label]="fieldLabel(field)" [yesNo]="!!field.yesNo"
                [formControlName]="field.property"></app-control-toggle>
              <app-control-toggle *ngSwitchCase="'aspect'" [inline]="true" [label]="labelOf(field.label)"
                [formControl]="field.control"></app-control-toggle>
              <div *ngSwitchCase="'segmented'">
                <span class="small fw-semibold d-block mb-1">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></span>
                <app-segmented [options]="field.options" [formControlName]="field.property"></app-segmented>
              </div>
              <div *ngSwitchCase="'select'" class="select-wrapper">
                <label [for]="id(field)">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <select [id]="id(field)" [formControlName]="field.property">
                  <option value=""></option>
                  <option *ngFor="let o of field.options" [value]="o.value">{{ labelOf(o.label) }}</option>
                </select>
              </div>
              <div *ngSwitchCase="'textarea'" class="form-group mb-0">
                <label [for]="id(field)" class="active">{{ labelOf(field.label) }}<span *ngIf="field.required"> *</span></label>
                <textarea [id]="id(field)" class="form-control" rows="3" [formControlName]="field.property"></textarea>
              </div>
              <div *ngSwitchCase="'date'" class="form-group mb-0">
                <app-control-datepicker [inline]="true" [time]="!!field.time" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-datepicker>
              </div>
              <div *ngSwitchDefault class="form-group mb-0" (focusout)="padProtocollo(field)">
                <app-control-text type="text" [inline]="true" [labelactive]="true" [label]="fieldLabel(field)"
                  [formControlName]="field.property"></app-control-text>
              </div>
            </ng-container>
          </div></ng-container>
            </ng-container>
          </div>
        </ng-container>
`;

@Component({
  standalone: false,
  selector: 'app-aspect-generic',
  template: `
    <div class="generic-aspect p-3" *ngIf="form">
      <div *ngIf="loading" class="d-flex align-items-center gap-2 small text-secondary">
        <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}
      </div>
      <div *ngIf="!loading && fields.length === 0" class="small text-secondary">{{ aspectType }}</div>
      <form [formGroup]="form" *ngIf="!loading && fields.length">
`+GENERIC_FIELDS_TEMPLATE+`      </form>
    </div>
  `,
  styles: [GENERIC_FIELDS_STYLES]
})
export class JcononAspectGenericComponent extends DynamicComponent<Application> {
  /** Chiave dell'aspect (impostata dal servizio dinamico). */
  public aspectType: string;
  public fields: GenericField[] = [];
  public loading = true;
  /** Proprietà del bulkinfo non rese come campi (es. titolo e descrizione degli allegati, gestiti a parte). */
  protected excluded: string[] = ['cmis:name', 'cmis:objectTypeId', 'cmis:objectId'];

  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private configService: ConfigService,
    private translateService: TranslateService,
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (!this.aspectType) {
      this.afterFieldsLoaded();
      this.loading = false;
      return;
    }
    let params = new HttpParams();
    const objectId = this.data && (this.data as any).objectId;
    if (objectId) {
      params = params.set('cmis:objectId', objectId);
    }
    this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get<any>(gateway + '/rest/bulkInfo/view/' + encodeURIComponent(this.aspectType) + '/form/default', { params }))
    ).subscribe(view => {
      this.buildFields(view);
      this.applyImplementedAspects(view);
      this.afterFieldsLoaded();
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }, () => {
      this.afterFieldsLoaded();
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  /** Valori interpretati come "sì" (le proprietà sì/no sono d:boolean: si salva true/false). */
  private readonly yesValues = ['true', 'y', 'yes', 's', 'si', 'sì', '1'];
  private readonly noValues = ['false', 'n', 'no', '0'];

  /** Due opzioni sì/no: per etichetta (label.option.yes/no) o per chiave (true/false, Y/N, sì/no). */
  protected isYesNo(options: { value: string, label: string }[]): boolean {
    if (options.length !== 2) {
      return false;
    }
    const labels = options.map(o => String(o.label).toLowerCase());
    if (labels.some(l => l.endsWith('option.yes')) && labels.some(l => l.endsWith('option.no'))) {
      return true;
    }
    const keys = options.map(o => String(o.value).toLowerCase());
    return keys.some(k => this.yesValues.includes(k)) && keys.some(k => this.noValues.includes(k));
  }

  /** Etichetta del campo: traduzione (anche nella forma con il punto), altrimenti testo leggibile dalla chiave. */
  public labelOf(key: string): string {
    if (!key) {
      return '';
    }
    for (const candidate of [key, key.replace(/:/g, '.')]) {
      const translated = this.translateService.instant(candidate);
      if (translated && translated !== candidate) {
        return translated;
      }
    }
    if (/\s/.test(key) || !/[._:]/.test(key)) {
      return key;
    }
    const last = key.split(/[.:]/).filter(part => !!part).pop() || key;
    const text = last.replace(/^fl_/, '').replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** Valore booleano di un campo (anche se espresso come stringa). */
  protected controlOf(field: GenericField) {
    return field.control || this.form.get(field.property);
  }

  protected booleanValue(field: GenericField): boolean {
    const value = this.controlOf(field)?.value;
    return value === true || this.yesValues.includes(String(value).toLowerCase());
  }

  public isVisible(field: GenericField): boolean {
    if (!field.showWhen) {
      return true;
    }
    const parent = this.fields.find(f => f.name === field.showWhen.field);
    if (!parent) {
      return false;
    }
    const expected = field.showWhen.value;
    if (typeof expected === 'boolean') {
      return this.booleanValue(parent) === expected;
    }
    return String(this.controlOf(parent)?.value ?? '').startsWith(expected);
  }

  /**
   * Campi raggruppati: ogni interruttore (sì/no o aspect) con i campi che dipendono da lui; gli altri campi
   * consecutivi in gruppi senza intestazione. L'ordine del bulkinfo è mantenuto.
   */
  public groups(): { head?: GenericField, fields: GenericField[] }[] {
    if (this.groupsCache && this.groupsCacheFor === this.fields && this.groupsCacheSize === this.fields.length) {
      return this.groupsCache;
    }
    const heads = new Set(this.fields.filter(f => f.showWhen).map(f => f.showWhen.field));
    const byHead = new Map<string, { head?: GenericField, fields: GenericField[] }>();
    const result: { head?: GenericField, fields: GenericField[] }[] = [];
    let plain: { head?: GenericField, fields: GenericField[] };
    this.fields.forEach(field => {
      if (field.showWhen && byHead.has(field.showWhen.field)) {
        byHead.get(field.showWhen.field).fields.push(field);
      } else if (heads.has(field.name)) {
        const group = { head: field, fields: [] };
        byHead.set(field.name, group);
        result.push(group);
        plain = undefined;
      } else {
        if (!plain) {
          plain = { fields: [] };
          result.push(plain);
        }
        plain.fields.push(field);
      }
    });
    this.groupsCache = result;
    this.groupsCacheFor = this.fields;
    this.groupsCacheSize = this.fields.length;
    return result;
  }
  private groupsCache: { head?: GenericField, fields: GenericField[] }[];
  private groupsCacheFor: GenericField[];
  private groupsCacheSize = -1;

  /** Il riquadro di un interruttore mostra i suoi campi se almeno uno è visibile. */
  public groupOpen(group: { head?: GenericField, fields: GenericField[] }): boolean {
    return group.fields.some(field => this.isVisible(field));
  }

  /** Campo a tutta larghezza (interruttori, aree di testo, opzioni); date e testi brevi stanno su due colonne. */
  public isWide(field: GenericField): boolean {
    return ['toggle', 'aspect', 'textarea', 'segmented', 'select'].includes(field.kind);
  }

  /**
   * Etichetta per proprietà che nel bulkinfo legacy non ne hanno una (resa da widget dedicati, es. ui.protocollo):
   * chiave "label.<prefisso>_<nome>" se tradotta.
   */
  protected knownLabel(property: string): string {
    const key = 'label.' + String(property).replace(/:/g, '_');
    return this.translateService.instant(key) !== key ? key : undefined;
  }

  /**
   * Aspect dichiarati dal bulkinfo del tipo (cmisImplementsName, nella vista JSON come "aspect"): si applicano
   * sempre al documento, tranne quelli gestiti da un interruttore add-remove-aspect (es. Gazzetta Ufficiale, inPA).
   * Es. P:jconon_attachment:prorogation, da cui dipende l'aggiornamento delle date del bando dopo una proroga.
   */
  protected applyImplementedAspects(view: any): void {
    const toggled = new Set(this.fields.filter(f => f.kind === 'aspect').map(f => f.property.replace(/^aspect:/, '')));
    (Array.isArray(view && view.aspect) ? view.aspect : [])
      .map((aspect: any) => typeof aspect === 'string' ? aspect : (aspect && (aspect.name || aspect.key || aspect.id)))
      .filter((aspect: string) => !!aspect && aspect.startsWith('P:') && !toggled.has(aspect))
      .forEach((aspect: string) => this.setAspect(aspect, true));
  }

  /** Dopo il caricamento dei campi (anche se il bulkinfo non è disponibile): punto di estensione. */
  protected afterFieldsLoaded(): void {
  }

  /** Aggiunge o toglie un aspect dall'elenco degli aspect del documento (controllo "aspect" del form). */
  protected setAspect(aspectName: string, add: boolean): void {
    const aspectControl = this.form.get('aspect');
    if (!aspectControl) {
      return;
    }
    const current: string[] = Array.isArray(aspectControl.value) ? aspectControl.value : [];
    const next = add ? Array.from(new Set([...current, aspectName])) : current.filter(a => a !== aspectName);
    aspectControl.setValue(next);
  }

  /** I campi nascosti sono disattivati: non vengono validati né salvati. */
  protected applyVisibility(): void {
    this.fields.filter(f => f.showWhen).forEach(field => {
      const control = this.form.get(field.property);
      if (!control) {
        return;
      }
      const visible = this.isVisible(field);
      if (visible && control.disabled) {
        control.enable({ emitEvent: false });
      } else if (!visible && control.enabled) {
        control.disable({ emitEvent: false });
      }
    });
    this.changeDetectorRef.markForCheck();
  }

  /** Numero di protocollo completato con gli zeri iniziali (7 cifre). */
  padProtocollo(field: GenericField): void {
    if (!field.protocollo) {
      return;
    }
    const control = this.form.get(field.property);
    const padded = padProtocollo(control?.value);
    if (control && padded !== control.value) {
      control.setValue(padded);
    }
  }

  /**
   * Visibilità del documento (campo legacy inheritedPermission): Pubblico eredita i permessi del bando,
   * Privato no. Il valore iniziale è quello indicato dal bulkinfo del tipo (default="false" per atti e
   * documenti riservati), altrimenti Pubblico.
   */
  private visibilityField(def: any): GenericField {
    const property = 'inheritedPermission';
    const initial = [def.val, def.default, def.defaultValue]
      .map(v => Array.isArray(v) ? v[0] : v)
      .find(v => v !== undefined && v !== null && v !== '');
    const value = initial === undefined ? 'true' : String(initial).toLowerCase() === 'false' ? 'false' : 'true';
    if (!this.form.contains(property)) {
      this.form.addControl(property, new FormControl(value));
    } else if (!this.form.get(property).value) {
      this.form.get(property).setValue(value);
    }
    return {
      name: property,
      property,
      label: 'document.visibility.label',
      kind: 'segmented',
      options: [
        { value: 'true', label: 'document.visibility.public' },
        { value: 'false', label: 'document.visibility.private' }
      ],
      required: false
    } as GenericField;
  }

  /** Etichetta con l'asterisco dei campi obbligatori (per i controlli che ricevono l'etichetta come input). */
  fieldLabel(field: GenericField): string {
    return this.labelOf(field.label) + (field.required ? ' *' : '');
  }

  id(field: GenericField): string {
    return 'ga-' + field.property.replace(/[^A-Za-z0-9]/g, '-');
  }

  protected buildFields(view: any): void {
    // il legacy usa il form con il nome dell'aspect (con le classi di visibilità), altrimenti "default"
    const form = (view && (view[this.aspectType] || view['default'] || (view.forms && view[view.forms[0]]))) || {};
    const names = Object.keys(form);
    Object.keys(form).forEach(key => {
      const def = form[key] || {};
      const property = def.property || def.name;
      if (!property || this.excluded.includes(property) || def.visible === false || def.visible === 'false') {
        return;
      }
      // visibilità del documento: campo del bulkinfo senza proprietà CMIS, con il suo valore predefinito
      if (property === 'inheritedPermission') {
        this.fields.push(this.visibilityField(def));
        return;
      }
      // proprietà tecniche senza etichetta (es. jconon_call:new_numero_gu) non sono campi da compilare
      if (!def.label && !def.jsonlabel && !this.knownLabel(property)) {
        return;
      }
      // valori aggiornati dalle procedure (es. jconon_call:new_numero_gu), non campi da compilare
      if (/^jconon_call:new_/.test(property)) {
        return;
      }
      if (property === 'add-remove-aspect') {
        this.fields.push(this.aspectField(key, def));
        return;
      }
      const list: any[] = Array.isArray(def.jsonlist) ? def.jsonlist : [];
      const options = list.map(o => ({ value: String(o.key), label: o.label || o.defaultLabel || String(o.key) }));
      const keys = options.map(o => o.value.toLowerCase()).sort().join(',');
      const widget = String(def.widget || '').toLowerCase();
      const inputType = String(def.inputType || '').toUpperCase();
      let kind: GenericField['kind'] = 'text';
      if (this.isYesNo(options) || inputType === 'CHECKBOX' || widget.includes('checkbox') || (widget.includes('radio') && !options.length)) {
        kind = 'toggle';
      } else if (options.length && options.length <= 3) {
        kind = 'segmented';
      } else if (options.length) {
        kind = 'select';
      } else if (widget.includes('date')) {
        kind = 'date';
      } else if (inputType === 'TEXTAREA' || widget.includes('wysiwyg') || widget.includes('textarea')) {
        kind = 'textarea';
      }
      // nei bulkinfo legacy l'obbligatorietà è sia jsonvalidator required sia requiredWidget
      const validator = def.jsonvalidator || {};
      const required = [validator.required, validator.requiredWidget, def.required, def.requiredWidget]
        .some(v => v === true || v === 'true');
      // radio sì/no (non "mandatory") obbligatorio: va solo risposto; checkbox e ui.mandatory.radio richiedono "Sì"
      const radio = widget.includes('radio') || inputType === 'RADIOGROUP' || inputType === 'RADIO' || this.isYesNo(options);
      // conta il widget del legacy (anche quello ricavato dalla descrizione nel modello, es. "1) ui.radio"); il tipo
      // di input solo se il widget non dice niente
      const mustBeTrue = widget.includes('mandatory') || widget.includes('checkbox') ||
        (!widget.includes('radio') && inputType === 'CHECKBOX');
      const yesNo = kind === 'toggle' && required && radio && !mustBeTrue;
      let value = def.val !== undefined && def.val !== null ? def.val : null;
      if (kind === 'toggle') {
        const raw = Array.isArray(value) ? value[0] : value;
        value = yesNo && (raw === null || raw === undefined || raw === '') ? null :
          this.yesValues.includes(String(raw).toLowerCase());
      } else if (Array.isArray(value)) {
        value = value[0];
      }
      if (!this.form.contains(property)) {
        const control = new FormControl(kind === 'date' && value ? new Date(value) : value);
        if (required) {
          control.setValidators(kind === 'toggle' && !yesNo ? Validators.requiredTrue : Validators.required);
        }
        this.form.addControl(property, control);
      }
      const name = def.name || key;
      // classi legacy "<campo>_true" / "<campo>_false": il campo dipende dal valore di un altro campo
      let showWhen: GenericField['showWhen'];
      String(def['class'] || '').split(/\s+/).forEach(token => {
        const parent = names
          .filter(n => n !== name && token.startsWith(n + '_'))
          .sort((a, b) => b.length - a.length)[0];
        if (!parent) {
          return;
        }
        const suffix = token.substring(parent.length + 1);
        if (suffix === 'true' || suffix === 'false') {
          showWhen = { field: parent, value: suffix === 'true' };
        } else if (/^add(-|$)/.test(suffix) || /^remove(-|$)/.test(suffix)) {
          showWhen = { field: parent, value: suffix.startsWith('add') };
        } else {
          showWhen = { field: parent, value: suffix };
        }
      });
      const time = kind === 'date' && (widget.includes('datetime') || /H/.test(String(def.format || '')));
      const protocollo = kind === 'text' && (widget.includes('protocollo') || property === 'jconon_protocollo:numero');
      this.fields.push({ name, property, showWhen, label: def.label || def.jsonlabel?.key || this.knownLabel(property) || property,
        kind, options, required, time, protocollo, yesNo });
    });
    this.applyVisibility();
    // aggiorna la visibilità dei campi dipendenti quando cambia il campo da cui dipendono
    this.fields.filter(f => f.showWhen).forEach(field => {
      const parent = this.fields.find(f => f.name === field.showWhen.field);
      const control = parent && this.controlOf(parent);
      if (control) {
        control.valueChanges.subscribe(() => this.applyVisibility());
      }
    });
  }

  /**
   * Campo legacy "add-remove-aspect" (es. Gazzetta Ufficiale, inPA): un sì/no che aggiunge o toglie l'aspect
   * al documento. Il controllo è locale: si aggiorna l'elenco "aspect" del form, non una proprietà.
   */
  protected aspectField(key: string, def: any): GenericField {
    const options: any[] = Array.isArray(def.jsonlist) ? def.jsonlist : [];
    const aspectName = String(def.default || (options[0] && options[0].key) || '').replace(/^(add|remove)-/, '');
    const current = this.form.get('aspect')?.value;
    const val = String(Array.isArray(def.val) ? def.val[0] : (def.val ?? ''));
    const initial = val.startsWith('add-') || (Array.isArray(current) && current.includes(aspectName));
    const control = new FormControl(initial);
    control.valueChanges.subscribe(add => this.setAspect(aspectName, !!add));
    if (initial) {
      this.setAspect(aspectName, true);
    }
    return { name: def.name || key, property: 'aspect:' + aspectName, label: def.label || def.jsonlabel?.key || aspectName,
      kind: 'aspect', options: [], required: false, control };
  }
}
