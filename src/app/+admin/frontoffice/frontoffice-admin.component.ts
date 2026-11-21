import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FaqItem, FrontOfficeService, Notice } from '../../core/frontoffice/frontoffice.service';
import { CacheService } from '../../core/cache.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

/**
 * Avvisi e FAQ (ex pagina "Front Office" del legacy): elenco con filtri, creazione, modifica ed eliminazione.
 * Gli avvisi validi (pubblicati e non scaduti) compaiono nella home; le FAQ visibili nella pagina F.A.Q.
 */
@Component({
    standalone: false,
    selector: 'app-frontoffice-admin',
    template: `
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <div class="btn-group" role="group">
        <button type="button" class="btn btn-sm" [ngClass]="kind === 'notice' ? 'btn-primary' : 'btn-outline-primary'" (click)="switchTo('notice')">{{ 'notice.title' | translate }}</button>
        <button type="button" class="btn btn-sm" [ngClass]="kind === 'faq' ? 'btn-primary' : 'btn-outline-primary'" (click)="switchTo('faq')">FAQ</button>
      </div>
      <button type="button" class="btn btn-primary btn-sm ms-auto" (click)="create()">
        <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus"></use></svg>{{ 'notice.create' | translate }}
      </button>
    </div>

    <!-- filtri -->
    <form [formGroup]="filters" (ngSubmit)="load()" class="card card-bg mb-3">
      <div class="card-body row align-items-end">
        <div class="form-group col-md-4">
          <label for="fo-type" class="active">{{ 'notice.type' | translate }}</label>
          <select id="fo-type" class="form-select" formControlName="typeBando">
            <option value="">{{ 'notice.all_types' | translate }}</option>
            <option *ngFor="let t of types" [value]="t">{{ t | translate }}</option>
          </select>
        </div>
        <div class="form-group col-md-2">
          <label for="fo-after" class="active">{{ 'notice.published_from' | translate }}</label>
          <input id="fo-after" type="date" class="form-control" formControlName="after">
        </div>
        <div class="form-group col-md-2">
          <label for="fo-before" class="active">{{ 'notice.published_to' | translate }}</label>
          <input id="fo-before" type="date" class="form-control" formControlName="before">
        </div>
        <div *ngIf="kind === 'faq'" class="form-group col-md-2">
          <label for="fo-filter" class="active">{{ 'notice.question_contains' | translate }}</label>
          <input id="fo-filter" type="text" class="form-control" formControlName="filter">
        </div>
        <div class="form-group col text-end">
          <button type="submit" class="btn btn-outline-primary btn-sm">{{ 'search' | translate }}</button>
        </div>
      </div>
    </form>

    <!-- form di creazione e modifica: titolo nell'intestazione, campi in griglia, pulsanti nel footer -->
    <form *ngIf="editing" class="card card-bg fo-form mb-4" [formGroup]="form" (ngSubmit)="save()">
      <div class="card-header bg-transparent">
        <h2 class="h5 text-primary mb-0">{{ (form.value.nodeRefToEdit ? 'notice.edit' : 'notice.create') | translate }} — {{ kind === 'notice' ? ('notice.title' | translate) : 'FAQ' }}</h2>
      </div>
      <div class="card-body">
        <!-- avviso -->
        <ng-container *ngIf="kind === 'notice'">
          <div class="row gx-4">
            <div class="form-group col-md-8">
              <label for="n-title" class="active">{{ 'notice.notice_title' | translate }} *</label>
              <input id="n-title" type="text" class="form-control" formControlName="title">
            </div>
            <div class="form-group col-md-4">
              <label for="n-style" class="active">{{ 'notice.style' | translate }}</label>
              <select id="n-style" class="form-select" formControlName="style">
                <option *ngFor="let s of styles" [value]="s">{{ 'notice.styles.' + s | translate }}</option>
              </select>
            </div>
          </div>
          <div class="row gx-4">
            <div class="form-group col-md-6">
              <label for="n-type" class="active">{{ 'notice.type' | translate }}</label>
              <select id="n-type" class="form-select" formControlName="type">
                <option value="">{{ 'notice.all_types' | translate }}</option>
                <option *ngFor="let t of types" [value]="t">{{ t | translate }}</option>
              </select>
            </div>
            <div class="form-group col-md-3">
              <label for="n-data" class="active">{{ 'notice.published' | translate }} *</label>
              <input id="n-data" type="date" class="form-control" formControlName="data">
            </div>
            <div class="form-group col-md-3">
              <label for="n-scad" class="active">{{ 'notice.expires' | translate }} *</label>
              <input id="n-scad" type="date" class="form-control" formControlName="dataScadenza">
            </div>
          </div>
          <!-- allineata in basso: il campo Utente (sotto le schede Utente/Gruppo) e il Numero stanno sulla stessa linea -->
          <div class="row gx-4 align-items-end">
            <div class="form-group col-md-9">
              <app-authority-picker mode="both" formControlName="authority"></app-authority-picker>
            </div>
            <div class="form-group col-md-3">
              <label for="n-number" class="active">{{ 'notice.number' | translate }}</label>
              <input id="n-number" type="number" class="form-control" formControlName="number">
            </div>
          </div>
          <small class="form-text">{{ 'notice.authority_info' | translate }}</small>
        </ng-container>

        <!-- FAQ -->
        <ng-container *ngIf="kind === 'faq'">
          <div class="row gx-4">
            <div class="form-group col-md-6">
              <label for="n-type" class="active">{{ 'notice.type' | translate }}</label>
              <select id="n-type" class="form-select" formControlName="type">
                <option value="">{{ 'notice.all_types' | translate }}</option>
                <option *ngFor="let t of types" [value]="t">{{ t | translate }}</option>
              </select>
            </div>
            <div class="form-group col-md-3">
              <label for="n-data" class="active">{{ 'notice.published' | translate }} *</label>
              <input id="n-data" type="date" class="form-control" formControlName="data">
            </div>
            <div class="form-group col-md-3">
              <label for="n-number" class="active">{{ 'notice.number' | translate }}</label>
              <input id="n-number" type="number" class="form-control" formControlName="number">
            </div>
          </div>
          <div class="row gx-4">
            <div class="form-group col-12">
              <label for="n-question" class="active">{{ 'notice.question' | translate }} *</label>
              <textarea id="n-question" class="form-control" rows="2" formControlName="question"></textarea>
            </div>
          </div>
          <div class="form-check fo-check">
            <input id="n-show" type="checkbox" formControlName="show">
            <label for="n-show">{{ 'notice.visible' | translate }}</label>
          </div>
        </ng-container>

        <div class="form-group">
          <app-control-ckeditor [inline]="true" [label]="(kind === 'notice' ? 'notice.text' : 'notice.answer') | translate"
                                formControlName="text"></app-control-ckeditor>
        </div>
      </div>
      <div class="card-footer bg-transparent d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="editing = false">{{ 'button.cancel' | translate }}</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid || busy">{{ 'save' | translate }}</button>
      </div>
    </form>

    <app-layout-wait [loaded]="items"></app-layout-wait>
    <p *ngIf="items" class="small text-secondary">{{ 'notice.found' | translate:{ value: items.length } }}</p>
    <div *ngIf="items && !items.length" class="alert alert-info">{{ 'no_item' | translate }}</div>
    <div *ngFor="let item of items" class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span class="badge rounded-pill" [ngClass]="badge(item)">{{ state(item) | translate }}</span>
          <span class="badge rounded-pill bg-light text-dark">#{{ item.number }}</span>
          <span *ngIf="item.type || item.faqBando" class="small text-secondary">{{ (item.type || item.faqBando) | translate }}</span>
          <span class="ms-auto small text-secondary">
            {{ 'notice.published' | translate }} {{ date(item.dataPubblicazione) | date:'dd/MM/yyyy' }}
            <ng-container *ngIf="item.dataScadenza"> · {{ 'notice.expires' | translate }} {{ date(item.dataScadenza) | date:'dd/MM/yyyy' }}</ng-container>
          </span>
        </div>
        <h3 class="h6 mb-1">{{ item.title || item.question || item.name }}</h3>
        <div class="small notice-text" appContentLinks [innerHTML]="item.text || item.answer"></div>
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button type="button" class="btn btn-outline-primary btn-xs" (click)="edit(item)">{{ 'edit' | translate }}</button>
          <button type="button" class="btn btn-outline-danger btn-xs" (click)="remove(item)">{{ 'delete' | translate }}</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .notice-text { white-space: pre-line; }
    /* i menu a tendina con la stessa linea inferiore dei campi di testo */
    select.form-select { border: 0; border-bottom: 1px solid #5d7083; border-radius: 0; background-color: transparent;
      padding-left: .5rem; height: 2.5rem; box-shadow: none; }
    select.form-select:focus { border-bottom-color: #0066cc; outline: 2px solid #ff9900; outline-offset: 2px; }
    .fo-form .card-body { padding: .5rem 1.5rem 1.5rem; }
    .fo-form .form-group { margin-top: 1.75rem; margin-bottom: 0; }
    .fo-form .fo-check { margin-top: 1.5rem; }
    .fo-form .form-text { display: block; margin-top: .5rem; }
  `]
})
export class FrontOfficeAdminComponent implements OnInit {
    public kind: 'notice' | 'faq' = 'notice';
    public items: any[];
    public types: string[] = [];
    public styles = ['information', 'success', 'warning', 'alert', 'error'];
    public filters: FormGroup;
    public form: FormGroup;
    public editing = false;
    public busy = false;

    constructor(private frontOffice: FrontOfficeService,
                private formBuilder: FormBuilder,
                private cacheService: CacheService,
                private apiMessageService: ApiMessageService,
                private modalService: ModalService,
                private translateService: TranslateService) {}

    ngOnInit(): void {
        this.filters = this.formBuilder.group({ typeBando: [''], after: [''], before: [''], filter: [''] });
        this.cacheService.cache().subscribe((cache: any) => {
            const flatten = (list: any[]): string[] => (list || []).reduce((acc, t) => acc.concat(t.key || t.id, flatten(t.childs)), []);
            this.types = flatten(cache?.jsonlistCallType).filter(Boolean);
        });
        this.load();
    }

    switchTo(kind: 'notice' | 'faq'): void {
        this.kind = kind;
        this.editing = false;
        this.load();
    }

    load(): void {
        this.items = undefined;
        const v = this.filters.value;
        const millis = (day: string) => day ? String(new Date(day + 'T12:00:00Z').getTime()) : '';
        const filters: any = { typeBando: v.typeBando, after: millis(v.after), before: millis(v.before) };
        if (this.kind === 'faq') {
            filters.filter = v.filter;
        }
        const request: Observable<any> = this.kind === 'notice' ? this.frontOffice.manageNotices(filters) : this.frontOffice.manageFaq(filters);
        request.subscribe((result: any) => this.items = result?.docs || [], () => this.items = []);
    }

    create(): void {
        const today = new Date().toISOString().substring(0, 10);
        this.buildForm({ data: today, show: true, style: 'information' });
    }

    edit(item: any): void {
        this.buildForm({
            nodeRefToEdit: item.nodeRef,
            title: item.title,
            text: this.kind === 'notice' ? item.text : item.answer,
            question: item.question,
            type: item.type || item.faqBando || '',
            style: item.noticeStyle || 'information',
            data: FrontOfficeService.isoDay(item.dataPubblicazione),
            dataScadenza: FrontOfficeService.isoDay(item.dataScadenza),
            number: item.number,
            show: !!item.show
        });
    }

    save(): void {
        const v = this.form.value;
        this.busy = true;
        const request: Observable<any> = this.kind === 'notice'
            ? this.frontOffice.saveNotice({ nodeRefToEdit: v.nodeRefToEdit, title: v.title, text: v.text, type: v.type, style: v.style,
                data: v.data, dataScadenza: v.dataScadenza, authority: v.authority, number: v.number })
            : this.frontOffice.saveFaq({ nodeRefToEdit: v.nodeRefToEdit, question: v.question, answer: v.text, type: v.type,
                data: v.data, show: v.show, number: v.number });
        request.subscribe(() => {
            this.busy = false;
            this.editing = false;
            this.apiMessageService.sendMessage(MessageType.SUCCESS, 'notice.saved');
            this.load();
        }, () => this.busy = false);
    }

    remove(item: any): void {
        const ref = this.modalService.show(ModalConfirmComponent, {
            initialState: { body: this.translateService.instant('notice.confirm_delete', { value: item.title || item.question || item.name }) },
            class: 'modal-dialog-centered'
        });
        ref.content.confirm.subscribe(() => this.frontOffice.delete(item.nodeRef).subscribe(() => {
            this.apiMessageService.sendMessage(MessageType.SUCCESS, 'notice.deleted');
            this.load();
        }));
    }

    date(value: string): Date {
        return FrontOfficeService.date(value);
    }

    /** Stato come nel legacy: avviso attivo/scaduto/da pubblicare, FAQ visibile/nascosta. */
    state(item: any): string {
        if (this.kind === 'faq') {
            return item.show ? 'notice.states.visible' : 'notice.states.hidden';
        }
        const now = new Date();
        const from = this.date(item.dataPubblicazione);
        const to = this.date(item.dataScadenza);
        if (from && from > now) {
            return 'notice.states.scheduled';
        }
        return to && to < now ? 'notice.states.expired' : 'notice.states.active';
    }

    badge(item: any): string {
        return ({ 'notice.states.visible': 'bg-success', 'notice.states.active': 'bg-success', 'notice.states.scheduled': 'bg-warning text-dark' } as any)[this.state(item)] || 'bg-secondary';
    }

    private buildForm(value: any): void {
        this.form = this.formBuilder.group({
            nodeRefToEdit: [value.nodeRefToEdit || ''],
            title: [value.title || '', this.kind === 'notice' ? Validators.required : null],
            question: [value.question || '', this.kind === 'faq' ? Validators.required : null],
            text: [value.text || ''],
            type: [value.type || ''],
            style: [value.style || 'information'],
            data: [value.data || '', Validators.required],
            dataScadenza: [value.dataScadenza || '', this.kind === 'notice' ? Validators.required : null],
            authority: [''],
            number: [value.number || ''],
            show: [value.show !== false]
        });
        this.editing = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
