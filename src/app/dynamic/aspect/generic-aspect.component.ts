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
  /** Visibile solo quando il campo indicato (per nome) vale questo booleano (classi legacy "<campo>_true/_false"). */
  showWhen?: { field: string, value: boolean };
  label: string;
  kind: 'toggle' | 'segmented' | 'select' | 'textarea' | 'date' | 'text';
  options: { value: string, label: string }[];
  required: boolean;
}

/**
 * Aspect della domanda senza un componente dedicato: la definizione dei campi viene letta dal bulkinfo
 * del tipo (come faceva il frontend legacy, /rest/bulkInfo/view/{tipo}/form/default) insieme ai valori
 * già salvati nella domanda. Ogni campo diventa un controllo del form della sezione, salvato come gli altri aspect.
 */
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
        <ng-container *ngFor="let field of fields">
        <div *ngIf="isVisible(field)" class="generic-field">
          <ng-container [ngSwitch]="field.kind">
            <app-control-toggle *ngSwitchCase="'toggle'" [inline]="true" [label]="labelOf(field.label)"
              [formControlName]="field.property"></app-control-toggle>
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
            <app-control-datepicker *ngSwitchCase="'date'" [inline]="true" [label]="labelOf(field.label)"
              [formControlName]="field.property"></app-control-datepicker>
            <app-control-text *ngSwitchDefault type="text" [inline]="true" [label]="labelOf(field.label)"
              [formControlName]="field.property"></app-control-text>
          </ng-container>
        </div>
        </ng-container>
      </form>
    </div>
  `,
  styles: [`
    .generic-field + .generic-field { margin-top: 1.25rem; }
    .generic-field .form-group, .generic-field .select-wrapper { margin-top: 1.5rem; }
  `]
})
export class JcononAspectGenericComponent extends DynamicComponent<Application> {
  /** Chiave dell'aspect (impostata dal servizio dinamico). */
  public aspectType: string;
  public fields: GenericField[] = [];
  public loading = true;

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
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }, () => {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  /** Valori interpretati come "sì" (le proprietà sì/no sono d:boolean: si salva true/false). */
  private readonly yesValues = ['true', 'y', 'yes', 's', 'si', 'sì', '1'];
  private readonly noValues = ['false', 'n', 'no', '0'];

  /** Due opzioni sì/no: per etichetta (label.option.yes/no) o per chiave (true/false, Y/N, sì/no). */
  private isYesNo(options: { value: string, label: string }[]): boolean {
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
  private booleanValue(property: string): boolean {
    const value = this.form.get(property)?.value;
    return value === true || this.yesValues.includes(String(value).toLowerCase());
  }

  public isVisible(field: GenericField): boolean {
    if (!field.showWhen) {
      return true;
    }
    const parent = this.fields.find(f => f.name === field.showWhen.field);
    return !!parent && this.booleanValue(parent.property) === field.showWhen.value;
  }

  /** I campi nascosti sono disattivati: non vengono validati né salvati. */
  private applyVisibility(): void {
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

  id(field: GenericField): string {
    return 'ga-' + field.property.replace(/[^A-Za-z0-9]/g, '-');
  }

  private buildFields(view: any): void {
    // il legacy usa il form con il nome dell'aspect (con le classi di visibilità), altrimenti "default"
    const form = (view && (view[this.aspectType] || view['default'] || (view.forms && view[view.forms[0]]))) || {};
    const names = Object.keys(form);
    Object.keys(form).forEach(key => {
      const def = form[key] || {};
      const property = def.property || def.name;
      if (!property || def.visible === false || def.visible === 'false') {
        return;
      }
      const list: any[] = Array.isArray(def.jsonlist) ? def.jsonlist : [];
      const options = list.map(o => ({ value: String(o.key), label: o.label || o.defaultLabel || String(o.key) }));
      const keys = options.map(o => o.value.toLowerCase()).sort().join(',');
      const widget = String(def.widget || '').toLowerCase();
      const inputType = String(def.inputType || '').toUpperCase();
      let kind: GenericField['kind'] = 'text';
      if (this.isYesNo(options) || inputType === 'CHECKBOX' || widget.includes('checkbox')) {
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
      const required = !!(def.jsonvalidator && (def.jsonvalidator.required === true || def.jsonvalidator.required === 'true'))
        || def.required === true || def.required === 'true';
      let value = def.val !== undefined && def.val !== null ? def.val : null;
      if (kind === 'toggle') {
        value = this.yesValues.includes(String(Array.isArray(value) ? value[0] : value).toLowerCase());
      } else if (Array.isArray(value)) {
        value = value[0];
      }
      if (!this.form.contains(property)) {
        const control = new FormControl(kind === 'date' && value ? new Date(value) : value);
        if (required) {
          control.setValidators(kind === 'toggle' ? Validators.requiredTrue : Validators.required);
        }
        this.form.addControl(property, control);
      }
      const name = def.name || key;
      // classi legacy "<campo>_true" / "<campo>_false": il campo dipende dal valore di un altro campo
      let showWhen: GenericField['showWhen'];
      String(def['class'] || '').split(/\s+/).forEach(token => {
        const m = /^(.+)_(true|false)$/.exec(token);
        if (m && names.includes(m[1]) && m[1] !== name) {
          showWhen = { field: m[1], value: m[2] === 'true' };
        }
      });
      this.fields.push({ name, property, showWhen, label: def.label || def.jsonlabel?.key || property, kind, options, required });
    });
    this.applyVisibility();
    // aggiorna la visibilità dei campi dipendenti quando cambia il campo da cui dipendono
    this.fields.filter(f => f.showWhen).forEach(field => {
      const parent = this.fields.find(f => f.name === field.showWhen.field);
      const control = parent && this.form.get(parent.property);
      if (control) {
        control.valueChanges.subscribe(() => this.applyVisibility());
      }
    });
  }
}
