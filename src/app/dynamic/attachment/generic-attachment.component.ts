import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../../core/cache.service';
import { ConfigService } from '../../core/config.service';
import { GENERIC_FIELDS_STYLES, GENERIC_FIELDS_TEMPLATE, JcononAspectGenericComponent } from '../aspect/generic-aspect.component';

/**
 * Allegato di un tipo senza componente dedicato, nella finestra di caricamento/modifica: titolo e descrizione
 * come per tutti gli allegati, più i metadati del tipo letti dal bulkinfo (stessa logica degli aspect generici).
 */
@Component({
  standalone: false,
  selector: 'app-attachment-generic-edit',
  template: `
    <form [formGroup]="form" *ngIf="form">
      <ng-container *ngIf="titled">
      <div class="row gx-2 w-100 pt-1">
        <div class="form-group col-md-12">
          <app-control-text [showValidation]="true" [focus]="true" [inline]="true" [label]="'title' | translate"
            formControlName="cm:title"></app-control-text>
        </div>
      </div>
      <div class="row gx-2 w-100 pt-1">
        <div class="form-group col-md-12">
          <app-control-textarea [showValidation]="true" rows="5" [inline]="true" [label]="'description' | translate"
            formControlName="cm:description"></app-control-textarea>
        </div>
      </div>
      </ng-container>
      <div *ngIf="loading" class="d-flex align-items-center gap-2 small text-secondary mt-2">
        <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}
      </div>
      <div class="generic-attachment-fields" *ngIf="!loading && fields.length">
` + GENERIC_FIELDS_TEMPLATE + `
      </div>
    </form>
  `,
  styles: [GENERIC_FIELDS_STYLES, `
    .generic-attachment-fields { margin-top: .25rem; }
  `]
})
export class JcononAttachmentGenericEditComponent extends JcononAspectGenericComponent {
  constructor(cacheService: CacheService, changeDetectorRef: ChangeDetectorRef, http: HttpClient,
              configService: ConfigService, translateService: TranslateService) {
    super(cacheService, changeDetectorRef, http, configService, translateService);
  }

  /** Titolo e descrizione solo se il tipo non ha campi nel bulkinfo (altrimenti sono i campi del bulkinfo). */
  public titled = false;

  ngOnInit(): void {
    this.aspect = ['P:cm:titled'];
    super.ngOnInit();
  }

  protected afterFieldsLoaded(): void {
    if (this.fields.length) {
      return;
    }
    this.titled = true;
    if (!this.form.contains('cm:title')) {
      this.form.addControl('cm:title', new FormControl(this.data ? (this.data as any).title : undefined));
    }
    if (!this.form.contains('cm:description')) {
      this.form.addControl('cm:description', new FormControl(this.data ? (this.data as any).description : undefined));
    }
  }
}

/**
 * Allegato di un tipo senza componente dedicato, in visualizzazione: nome, titolo e descrizione più i metadati
 * del tipo (dal bulkinfo, con i valori salvati), mostrati solo se valorizzati.
 */
@Component({
  standalone: false,
  selector: 'app-attachment-generic-show',
  template: `
    <table class="table table-striped table-hover table-borderless">
      <tbody>
        <tr><td class="fw-bolder">{{ 'name' | translate }}</td><td>{{ data?.name }}</td></tr>
        <tr><td class="fw-bolder">{{ 'title' | translate }}</td><td>{{ data?.title }}</td></tr>
        <tr><td class="fw-bolder">{{ 'description' | translate }}</td><td>{{ data?.description }}</td></tr>
        <ng-container *ngFor="let field of fields">
          <tr *ngIf="isVisible(field) && displayValue(field) as value">
            <td class="fw-bolder">{{ labelOf(field.label) }}</td><td>{{ value }}</td>
          </tr>
        </ng-container>
      </tbody>
    </table>
  `
})
export class JcononAttachmentGenericShowComponent extends JcononAspectGenericComponent {
  private readonly datePipe = new DatePipe('it-IT');

  constructor(cacheService: CacheService, changeDetectorRef: ChangeDetectorRef, http: HttpClient,
              configService: ConfigService, private translate: TranslateService) {
    super(cacheService, changeDetectorRef, http, configService, translate);
    this.excluded = [...this.excluded, 'cm:title', 'cm:description'];
  }

  ngOnInit(): void {
    // in visualizzazione i campi non entrano nel form della pagina: gruppo locale solo per leggere i valori
    this.form = new FormGroup({});
    super.ngOnInit();
  }

  /** Valore leggibile del campo (sì/no, date, etichetta dell'opzione); vuoto se non valorizzato. */
  displayValue(field: any): string {
    const value = this.form.get(field.property)?.value;
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (field.kind === 'toggle') {
      return this.translate.instant(value ? 'label.option.yes' : 'label.option.no');
    }
    if (value instanceof Date) {
      return this.datePipe.transform(value, 'dd/MM/yyyy') || '';
    }
    const option = (field.options || []).find((o: any) => o.value === String(value));
    return option ? this.labelOf(option.label) : String(value);
  }
}
