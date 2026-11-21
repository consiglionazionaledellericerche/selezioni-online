import { DocumentService } from '../../document/document.service';
import { ApplicationOperationsService } from '../../application/application-operations.service';
import { AuthService } from '../../../auth/auth.service';
import { ManageDocumentComponent } from '../../document/manage-document.component';
import { ShowMetadataComponent } from '../../../shared/tags/show/show-metadata.component';
import { padProtocollo } from '../../../common/helpers/protocollo';
import { ManageCallService } from '../manage-call.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Call } from '../call.model';
import { CallService } from '../call.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { ModalRef, ModalService } from '../../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../../shared/tags/wizard/modal-confirm.component';
import {
  CallCommunicationsService, CandidateApplication, CommunicationKind, CommunicationState, STATE_PROPERTY
} from '../call-communications.service';

/**
 * Convocazioni, esclusioni e comunicazioni ai candidati di un bando:
 * generazione dei documenti per i candidati scelti, poi firma digitale e invio (email/PEC).
 */
@Component({
  standalone: false,
  selector: 'call-communications',
  template: `
    <app-call-header [call]="call" page="communications.title"></app-call-header>
    <app-layout-title [title]="'communications.title'">
      <!-- sessioni d'esame: si formano con le convocazioni inviate -->
      <a *ngIf="kind === 'convocazioni'" class="btn btn-outline-primary me-2" [routerLink]="['/exam-sessions']" [queryParams]="{ callId: callId }">
        <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-files"></use></svg>
        {{ 'exam_sessions.title' | translate }}
      </a>
      <button *ngIf="section === 'documents'" type="button" class="btn btn-primary" (click)="openGenerate()">
        <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus-circle"></use></svg>
        {{ 'communications.new.' + kind | translate }}
      </button>
    </app-layout-title>

    <ul class="nav nav-tabs mt-3" role="tablist">
      <li class="nav-item" *ngFor="let k of kinds">
        <a class="nav-link" href="javascript:void(0)" role="tab" [class.active]="k === kind" [attr.aria-selected]="k === kind"
           (click)="selectKind(k)">{{ 'communications.kind.' + k | translate }}</a>
      </li>
    </ul>

    <!-- ============================ NUOVO INVIO ============================ -->
    <div *ngIf="section === 'generate'" class="d-flex flex-wrap align-items-center gap-3 mt-4 mb-2 generate-head">
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="closeGenerate()">
        <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-arrow-left"></use></svg>
        {{ 'communications.back_to_documents' | translate }}
      </button>
      <h2 class="h4 mb-0 text-primary">{{ 'communications.new.' + kind | translate }}</h2>
    </div>
    <div *ngIf="section === 'generate'" class="row align-items-start">
      <section class="col-lg-5 mb-4">
        <div class="card shadow-sm rounded p-3">
          <h2 class="h5 text-primary">{{ 'communications.recipients' | translate }}</h2>
          <div class="select-wrapper mb-3">
            <label for="cand-state">{{ 'layout.filter_application_state' | translate }}</label>
            <select id="cand-state" [(ngModel)]="candidateStatus" (change)="loadCandidates()">
              <option *ngFor="let s of candidateStates" [value]="s.value">{{ s.label | translate }}</option>
            </select>
          </div>
          <div class="form-group mb-2">
            <input type="search" class="form-control" [(ngModel)]="candidateFilter"
                   [placeholder]="'communications.filter_candidates' | translate">
          </div>
          <div class="d-flex justify-content-between align-items-center small mb-2">
            <div class="form-check mb-0">
              <input id="cand-all" type="checkbox" [checked]="allSelected()" (change)="toggleAll($any($event.target).checked)">
              <label for="cand-all">{{ 'communications.select_all' | translate }}</label>
            </div>
            <span class="text-secondary">{{ selected.size }} / {{ candidates?.length || 0 }}</span>
          </div>
          <app-layout-wait [loaded]="candidates"></app-layout-wait>
          <ul class="list-unstyled candidate-list mb-0" *ngIf="candidates">
            <li *ngFor="let c of filteredCandidates()">
              <div class="form-check my-1">
                <input [id]="'cand-' + c.id" type="checkbox" [checked]="selected.has(c.id)" (change)="toggle(c.id)">
                <label [for]="'cand-' + c.id">
                  <span class="fw-semibold">{{ c.cognome }} {{ c.nome }}</span>
                  <span class="small text-secondary ms-1">{{ c.codiceFiscale }}</span>
                </label>
              </div>
            </li>
            <li *ngIf="candidates.length === 0" class="small text-secondary" translate>no_item</li>
          </ul>
        </div>
      </section>

      <section class="col-lg-7 mb-4">
        <form class="card shadow-sm rounded p-3" [formGroup]="form" (ngSubmit)="generate()">
          <h2 class="h5 text-primary">{{ 'communications.content' | translate }}</h2>
          <ng-container *ngIf="kind === 'convocazioni'">
            <div class="row">
              <div class="form-group col-md-4">
                <label for="f-num" class="active">{{ 'communications.numero' | translate }} *</label>
                <input id="f-num" type="number" min="1" class="form-control" formControlName="numeroConvocazione">
              </div>
              <div class="form-group col-md-8">
                <label for="f-data" class="active">{{ 'communications.data' | translate }} *</label>
                <input id="f-data" type="datetime-local" class="form-control" formControlName="data">
              </div>
            </div>
            <div class="form-group">
              <label for="f-luogo" class="active">{{ 'communications.luogo' | translate }} *</label>
              <textarea id="f-luogo" class="form-control" rows="2" formControlName="luogo"></textarea>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <span class="small fw-semibold d-block mb-1">{{ 'communications.testo_libero' | translate }}</span>
                <app-segmented [options]="yesNo" formControlName="testoLibero"></app-segmented>
              </div>
              <div class="col-md-6">
                <span class="small fw-semibold d-block mb-1">{{ 'communications.qrcode' | translate }}</span>
                <app-segmented [options]="yesNo" formControlName="printQRCODE"></app-segmented>
              </div>
            </div>
          </ng-container>
          <ng-container *ngIf="kind === 'esclusioni'">
            <div class="mb-3">
              <span class="small fw-semibold d-block mb-1">{{ 'communications.tipo' | translate }}</span>
              <app-segmented [options]="exclusionTypes" formControlName="tipo"></app-segmented>
            </div>
            <div class="row">
              <div class="form-group col-md-6">
                <label for="f-pnum" class="active">{{ 'communications.protocollo_numero' | translate }}</label>
                <input id="f-pnum" type="text" class="form-control" formControlName="protocolloNumero">
              </div>
              <div class="form-group col-md-6">
                <label for="f-pdata" class="active">{{ 'communications.protocollo_data' | translate }}</label>
                <input id="f-pdata" type="date" class="form-control" formControlName="protocolloData">
              </div>
            </div>
            <div class="mb-3">
              <span class="small fw-semibold d-block mb-1">{{ 'communications.stampa_punteggi' | translate }}</span>
              <app-segmented [options]="yesNo" formControlName="stampaPunteggi"></app-segmented>
            </div>
          </ng-container>
          <div class="select-wrapper mb-3">
            <label for="f-app">{{ 'communications.appellativo' | translate }}</label>
            <select id="f-app" formControlName="appellativo">
              <option value=""></option>
              <option *ngFor="let a of appellativi" [value]="a.value">{{ a.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <!-- testo formattato con segnaposto [[...]] della domanda e del bando, come nel legacy -->
            <app-control-ckeditor [inline]="true" [label]="'communications.note' | translate" [placeholders]="placeholders"
                                  formControlName="note"></app-control-ckeditor>
          </div>
          <div class="form-group">
            <label for="f-firma" class="active">{{ 'communications.firma' | translate }} *</label>
            <textarea id="f-firma" class="form-control" rows="2" formControlName="firma"></textarea>
          </div>
          <!-- graduatoria privata: il file va negli allegati del bando come "Graduatoria privata" con il protocollo -->
          <ng-container *ngIf="kind === 'comunicazioni'">
            <div class="form-check mb-2">
              <input id="f-gp" type="checkbox" formControlName="graduatoriaPrivata">
              <label for="f-gp">{{ 'communications.graduatoria_privata.label' | translate }}</label>
            </div>
            <div *ngIf="form.value.graduatoriaPrivata" class="gp-box mb-3">
              <p class="small text-secondary mb-3">{{ 'communications.graduatoria_privata.info' | translate }}</p>
              <div class="row">
                <div class="form-group col-md-6">
                  <label for="f-gp-data" class="active">{{ 'communications.protocollo_data' | translate }} *</label>
                  <input id="f-gp-data" type="date" class="form-control" formControlName="gpData">
                </div>
                <div class="form-group col-md-6">
                  <label for="f-gp-num" class="active">{{ 'communications.protocollo_numero' | translate }} *</label>
                  <input id="f-gp-num" type="text" inputmode="numeric" class="form-control" formControlName="gpNumero"
                         (blur)="form.controls['gpNumero'].setValue(pad(form.value.gpNumero))">
                </div>
              </div>
            </div>
          </ng-container>
          <div class="form-group">
            <span class="small fw-semibold d-block mb-2">{{ 'communications.allegato' | translate }}<span *ngIf="graduatoriaPrivata()"> *</span></span>
            <it-upload-drag-drop #commUpload (fileStartUpload)="file = $event; commUpload.progress(100); commUpload.success()"></it-upload-drag-drop>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-secondary">{{ 'communications.selected_count' | translate:{value: selected.size} }}</span>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || selected.size === 0 || busy || !graduatoriaPrivataComplete()">
              {{ 'communications.generate' | translate }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- ============================ DOCUMENTI ============================ -->
    <div *ngIf="section === 'documents'">
      <app-layout-wait [loaded]="documents"></app-layout-wait>
      <div *ngIf="documents" class="state-tiles mt-4 mb-3" role="group" [attr.aria-label]="'communications.state' | translate">
        <button type="button" class="state-tile" [class.active]="stateFilter === ''" (click)="setFilter('')">
          <span class="state-count">{{ documents.length }}</span>
          <span class="state-label">{{ 'communications.states.all' | translate }}</span>
        </button>
        <button *ngFor="let st of presentStates()" type="button" class="state-tile" [ngClass]="'state-' + st"
                [class.active]="stateFilter === st" (click)="setFilter(st)">
          <span class="state-count">{{ count(st) }}</span>
          <span class="state-label">{{ stateLabel(st) }}</span>
        </button>
      </div>
      <div *ngIf="documents && documents.length" class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="small text-secondary me-auto">
          {{ (docSelected.size ? 'communications.selected_docs' : 'communications.shown_docs') | translate:{value: docSelected.size || visibleDocs().length} }}
        </span>
        <button class="btn btn-primary btn-sm" [disabled]="busy || targets('GENERATO').length === 0" (click)="openSign()">
          <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>
          {{ 'communications.sign' | translate }} ({{ targets('GENERATO').length }})
        </button>
        <!-- come nel legacy la firma è facoltativa: si inviano anche i documenti solo generati -->
        <button class="btn btn-primary btn-sm" [disabled]="busy || sendable().length === 0" (click)="openSend()">
          <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-mail"></use></svg>
          {{ 'communications.send' | translate }} ({{ sendable().length }})
        </button>
        <button class="btn btn-outline-danger btn-sm" [disabled]="busy || deletable().length === 0" (click)="deleteDocuments()">
          <svg class="icon icon-danger icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>
          {{ 'delete' | translate }} ({{ deletable().length }})
        </button>
      </div>
      <p *ngIf="documents && documents.length" class="small text-secondary">{{ 'communications.actions_hint' | translate }}</p>

      <div *ngIf="documents && visibleDocs().length === 0" class="alert alert-info" translate>no_item</div>
      <div class="table-responsive" *ngIf="documents && visibleDocs().length">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th style="width: 2.5rem">
                <input type="checkbox" class="native-check" [checked]="allDocsSelected()" (change)="toggleAllDocs($any($event.target).checked)"
                       [attr.aria-label]="'communications.select_all' | translate">
              </th>
              <th>{{ 'communications.document' | translate }}</th>
              <th>{{ 'communications.state' | translate }}</th>
              <th>{{ 'communications.modified' | translate }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of visibleDocs()">
              <td>
                <input type="checkbox" class="native-check" [checked]="docSelected.has(d['cmis:objectId'])"
                       (change)="toggleDoc(d['cmis:objectId'])" [attr.aria-label]="d['cmis:name']">
              </td>
              <td class="small">{{ d['cmis:name'] }}</td>
              <td><span class="badge rounded-pill" [ngClass]="stateClass(state(d))">{{ stateLabel(state(d), true) }}</span></td>
              <td class="small text-nowrap">{{ d['cmis:lastModificationDate'] | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-link btn-sm p-1" (click)="view(d)" [itTooltip]="'show' | translate">
                  <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-password-visible"></use></svg>
                  <span class="visually-hidden">{{ 'show' | translate }}</span>
                </button>
                <button type="button" class="btn btn-link btn-sm p-1" (click)="download(d)" [itTooltip]="'communications.download' | translate">
                  <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
                  <span class="visually-hidden">{{ 'communications.download' | translate }}</span>
                </button>
                <button type="button" class="btn btn-link btn-sm p-1" (click)="edit(d)" [itTooltip]="'edit' | translate">
                  <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>
                  <span class="visually-hidden">{{ 'edit' | translate }}</span>
                </button>
                <button type="button" class="btn btn-link btn-sm p-1" (click)="replaceInput.click()" [itTooltip]="'communications.replace' | translate">
                  <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-upload"></use></svg>
                  <span class="visually-hidden">{{ 'communications.replace' | translate }}</span>
                </button>
                <input #replaceInput type="file" class="d-none" accept=".pdf,.p7m,application/pdf" (change)="replace(d, $event)">
                <button *ngIf="state(d) === 'GENERATO' || state(d) === 'FIRMATO'" type="button" class="btn btn-link btn-sm p-1"
                        (click)="deleteOne(d)" [itTooltip]="'delete' | translate">
                  <svg class="icon icon-sm icon-danger"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>
                  <span class="visually-hidden">{{ 'delete' | translate }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- finestra firma -->
    <ng-template #signTemplate>
      <div class="modal-header">
        <h2 class="modal-title h5">{{ 'communications.sign' | translate }}</h2>
      </div>
      <form [formGroup]="signForm" (ngSubmit)="sign()">
        <div class="modal-body pt-3">
          <p class="small">{{ 'communications.sign_info' | translate:{value: targets('GENERATO').length} }}</p>
          <div class="form-check mb-3">
            <input id="sign-auto" type="checkbox" formControlName="firmaAutomatica">
            <label for="sign-auto">{{ 'communications.sign_auto' | translate }}</label>
          </div>
          <p *ngIf="signForm.value.firmaAutomatica" class="small text-secondary">{{ 'communications.sign_auto_info' | translate }}</p>
          <div class="form-group"><label for="sign-user" class="active">{{ (signForm.value.firmaAutomatica ? 'communications.sign_user_auto' : 'communications.sign_user') | translate }} *</label>
            <input id="sign-user" class="form-control" formControlName="userName" autocomplete="username"></div>
          <div class="form-group"><label for="sign-pwd" class="active">{{ 'communications.sign_password' | translate }} *</label>
            <input id="sign-pwd" type="password" class="form-control" formControlName="password" autocomplete="current-password"></div>
          <div class="form-group"><label for="sign-otp" class="active">{{ (signForm.value.firmaAutomatica ? 'communications.sign_otp_auto' : 'communications.sign_otp') | translate }} *</label>
            <input id="sign-otp" class="form-control" formControlName="otp" autocomplete="one-time-code"></div>
        </div>
        <div class="modal-footer d-flex justify-content-between">
          <button type="button" class="btn btn-outline-secondary" (click)="modalRef?.hide()" translate>button.cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="busy || signForm.invalid">{{ 'communications.sign' | translate }}</button>
        </div>
      </form>
    </ng-template>

    <!-- finestra invio -->
    <ng-template #sendTemplate>
      <div class="modal-header">
        <h2 class="modal-title h5">{{ 'communications.send' | translate }}</h2>
      </div>
      <form [formGroup]="sendForm" (ngSubmit)="send()">
        <div class="modal-body pt-3">
          <p class="small">{{ 'communications.send_info' | translate:{value: sendable().length} }}</p>
          <div *ngIf="targets('GENERATO').length" class="alert alert-warning small py-2">{{ 'communications.send_unsigned' | translate:{value: targets('GENERATO').length} }}</div>
          <div class="select-wrapper mb-3">
            <label for="send-addr">{{ 'communications.address' | translate }}</label>
            <select id="send-addr" formControlName="addressFromApplication">
              <option value="EMAIL">{{ 'communications.address_email' | translate }}</option>
              <option value="PEC">{{ 'communications.address_pec' | translate }}</option>
              <option value="DOC">{{ 'communications.address_doc' | translate }}</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input id="send-pec" type="checkbox" formControlName="pec">
            <label for="send-pec">{{ 'communications.send_pec' | translate }}</label>
          </div>
          <ng-container *ngIf="sendForm.value.pec">
            <div class="form-group"><label for="pec-user" class="active">{{ 'communications.pec_user' | translate }}</label>
              <input id="pec-user" class="form-control" formControlName="userNamePEC" autocomplete="username"></div>
            <div class="form-group"><label for="pec-pwd" class="active">{{ 'communications.pec_password' | translate }}</label>
              <input id="pec-pwd" type="password" class="form-control" formControlName="passwordPEC" autocomplete="current-password"></div>
          </ng-container>
        </div>
        <div class="modal-footer d-flex justify-content-between">
          <button type="button" class="btn btn-outline-secondary" (click)="modalRef?.hide()" translate>button.cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="busy">{{ 'communications.send' | translate }}</button>
        </div>
      </form>
    </ng-template>
  `,
  styles: [`
    .gp-box { padding: .75rem 1rem; background: #f7f9fc; border-left: 4px solid #0066cc; border-radius: 4px; }
    .candidate-list { max-height: 28rem; overflow: auto; }
    .state-tiles { display: flex; flex-wrap: wrap; gap: .75rem; }
    .state-tile { display: flex; flex-direction: column; align-items: flex-start; min-width: 9rem; padding: .6rem 1rem;
      background: #fff; border: 1px solid #d9dadb; border-left: 4px solid #5d7083; border-radius: 4px; text-align: left; cursor: pointer; }
    .state-tile:hover { background: #f0f6fc; }
    .state-tile.active { background: #e6f0fa; border-color: #0066cc; box-shadow: 0 0 0 1px #0066cc inset; }
    .state-tile.state-FIRMATO { border-left-color: #0066cc; }
    .state-tile.state-SPEDITO, .state-tile.state-CONSEGNATO, .state-tile.state-RICEVUTO { border-left-color: #008758; }
    .state-count { font-size: 1.5rem; font-weight: 700; line-height: 1.2; color: #17324d; }
    .state-label { font-size: .875rem; color: #5d7083; }
    .native-check { position: static !important; opacity: 1 !important; left: auto !important; width: 1.15rem; height: 1.15rem;
      margin: 0; vertical-align: middle; accent-color: var(--bs-primary, #0066cc); cursor: pointer; }
    .table td, .table th { vertical-align: middle; }
    .card h2 { margin-bottom: 2.25rem; }
    .card .form-group, .card .select-wrapper { margin-top: 2rem; margin-bottom: 1rem; }
    .card .row > .form-group { margin-top: 2rem; }
    .card .row.mb-3, .card .mb-3:has(> app-segmented) { margin-top: 1rem; }
  `]
})
export class CallCommunicationsComponent implements OnInit {
  @ViewChild('signTemplate') signTemplate: TemplateRef<any>;
  @ViewChild('sendTemplate') sendTemplate: TemplateRef<any>;

  public kinds: CommunicationKind[] = ['convocazioni', 'esclusioni', 'comunicazioni'];
  public kind: CommunicationKind = 'convocazioni';
  public call: Call;
  public callId: string;
  public sections = [
    { value: 'generate', label: 'communications.section_generate' },
    { value: 'documents', label: 'communications.section_documents' }
  ];
  public section: 'documents' | 'generate' = 'documents';
  public candidateStates = [
    { value: 'active', label: 'application.status.active' },
    { value: 'excluded', label: 'application.status.excluded' },
    { value: 'P', label: 'application.status.temporary' },
    { value: 'C', label: 'application.status.confirmed' },
    { value: 'all', label: 'application.status.all' }
  ];
  public candidateStatus = 'active';
  public candidateFilter = '';
  public candidates: CandidateApplication[];
  public selected = new Set<string>();
  public states = [
    { value: 'GENERATO', label: 'communications.states.GENERATO' },
    { value: 'FIRMATO', label: 'communications.states.FIRMATO' },
    { value: 'SPEDITO', label: 'communications.states.SPEDITO' },
    { value: 'CONSEGNATO', label: 'communications.states.CONSEGNATO' },
    { value: '', label: 'communications.states.all' }
  ];
  public stateFilter = '';
  private readonly stateOrder = ['GENERATO', 'FIRMATO', 'SPEDITO', 'CONSEGNATO', 'RICEVUTO'];
  public documents: any[];
  public docSelected = new Set<string>();
  public yesNo = [{ value: 'true', label: 'yes' }, { value: 'false', label: 'no' }];
  public exclusionTypes = [{ value: 'ESCLUSIONE', label: 'communications.esclusione' }, { value: 'RINUNCIA', label: 'communications.rinuncia' }];
  public appellativi = [
    { value: 'C', label: 'Al Sig. - Alla Sig.ra' },
    { value: 'D', label: 'Al Dott. - Alla Dott.ssa' },
    { value: 'P', label: 'Al Prof. - Alla Prof.ssa' },
    { value: 'E', label: 'Egregio Prof./Dott/Gent.ma Prof.ssa/Dott.ssa' },
    { value: 'PD', label: 'Al Prof./Dott. - Alla Prof.ssa/Dott.ssa' }
  ];
  public form: FormGroup;
  public signForm: FormGroup;
  public sendForm: FormGroup;
  public file: File;
  public busy = false;
  public modalRef: ModalRef;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private callService: CallService,
              private communicationsService: CallCommunicationsService,
              private modalService: ModalService,
              private apiMessageService: ApiMessageService,
              private translateService: TranslateService,
              private manageCallService: ManageCallService,
              private documentService: DocumentService,
              private operationsService: ApplicationOperationsService,
              private authService: AuthService) {}

  /** Segnaposto per le note: campi della domanda e del bando (come i jsonlist del legacy). */
  public placeholders: { key: string, label: string, group?: string }[] = [];

  private loadPlaceholders(): void {
    this.manageCallService.callManagementCache().subscribe(cache => {
      const items = [...(cache.jsonlistCallFields || []), ...(cache.jsonlistApplicationFieldsNotRequired || [])];
      const seen = new Set<string>();
      this.placeholders = items
        .filter(item => item && item.key && !seen.has(item.key) && seen.add(item.key))
        .map(item => ({ key: item.key, label: this.label(item), group: item.group }));
    }, () => this.placeholders = []);
  }

  private label(item: any): string {
    const key = item.label || item.key;
    const translated = this.translateService.instant(key);
    return translated && translated !== key ? translated : (item.defaultLabel || item.title || item.key);
  }

  ngOnInit(): void {
    this.loadPlaceholders();
    this.signForm = this.formBuilder.group({
      firmaAutomatica: [false],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      otp: ['', Validators.required]
    });
    this.sendForm = this.formBuilder.group({ addressFromApplication: ['EMAIL'], pec: [false], userNamePEC: [''], passwordPEC: [''] });
    this.route.queryParams.subscribe(params => {
      this.callId = params['callId'];
      this.kind = this.kinds.includes(params['kind']) ? params['kind'] : 'convocazioni';
      this.buildForm();
      if (this.callId && (!this.call || this.call.objectId !== this.callId)) {
        this.callService.getById(this.callId).subscribe(call => this.call = call);
      }
      this.candidateStatus = this.kind === 'esclusioni' ? 'excluded' : 'active';
      this.candidates = undefined;
      this.selected.clear();
      this.onSection();
    });
  }

  private buildForm(): void {
    const required = this.kind === 'convocazioni' ? [Validators.required] : [];
    this.form = this.formBuilder.group({
      numeroConvocazione: ['', required],
      data: ['', required],
      luogo: ['', required],
      testoLibero: ['false'],
      printQRCODE: ['false'],
      tipo: ['ESCLUSIONE'],
      protocolloNumero: [''],
      protocolloData: [''],
      stampaPunteggi: ['false'],
      graduatoriaPrivata: [false],
      gpData: [''],
      gpNumero: [''],
      appellativo: [''],
      note: [''],
      firma: ['', Validators.required]
    });
  }

  /** Comunicazione con graduatoria privata (solo per le comunicazioni). */
  graduatoriaPrivata(): boolean {
    return this.kind === 'comunicazioni' && !!this.form?.value?.graduatoriaPrivata;
  }

  /** Con la graduatoria privata servono documento, data e numero di protocollo. */
  graduatoriaPrivataComplete(): boolean {
    if (!this.graduatoriaPrivata()) {
      return true;
    }
    const v = this.form.value;
    return !!this.file && !!v.gpData && !!String(v.gpNumero || '').trim();
  }

  pad(value: any): any {
    return padProtocollo(value);
  }

  openGenerate(): void {
    this.section = 'generate';
    this.onSection();
  }

  closeGenerate(): void {
    this.section = 'documents';
    this.onSection();
  }

  selectKind(kind: CommunicationKind): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { callId: this.callId, kind }, replaceUrl: true });
  }

  onSection(): void {
    if (this.section === 'generate' && !this.candidates) {
      this.loadCandidates();
    }
    if (this.section === 'documents') {
      this.loadDocuments();
    }
  }

  /* destinatari */

  loadCandidates(): void {
    this.candidates = undefined;
    this.selected.clear();
    this.communicationsService.candidates(this.callId, this.candidateStatus)
      .subscribe(candidates => this.candidates = candidates, () => this.candidates = []);
  }

  filteredCandidates(): CandidateApplication[] {
    const term = (this.candidateFilter || '').toLowerCase().trim();
    return (this.candidates || []).filter(c => !term ||
      `${c.cognome} ${c.nome} ${c.codiceFiscale}`.toLowerCase().includes(term));
  }

  toggle(id: string): void {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
  }

  allSelected(): boolean {
    const visible = this.filteredCandidates();
    return visible.length > 0 && visible.every(c => this.selected.has(c.id));
  }

  toggleAll(checked: boolean): void {
    this.filteredCandidates().forEach(c => checked ? this.selected.add(c.id) : this.selected.delete(c.id));
  }

  generate(): void {
    const v = this.form.value;
    const data = new FormData();
    this.selected.forEach(id => data.append('application', id));
    const add = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        data.append(key, String(value));
      }
    };
    if (this.kind === 'convocazioni') {
      add('numeroConvocazione', v.numeroConvocazione);
      // il backend legge "yyyy-MM-dd'T'HH:mm:ss" come ora locale: niente conversione in UTC
      add('data', v.data ? new DatePipe('en-US').transform(new Date(v.data), "yyyy-MM-dd'T'HH:mm:ss") : null);
      add('luogo', v.luogo);
      add('testoLibero', v.testoLibero);
      add('printQRCODE', v.printQRCODE);
    }
    if (this.kind === 'esclusioni') {
      add('esclusioniType', 'GENERA');
      add('applicationFilter', 'ALL');
      add('tipo', v.tipo);
      add('jconon_protocollo:numero', v.protocolloNumero);
      add('jconon_protocollo:data', v.protocolloData ? ManageCallService.toCmisDate(new Date(v.protocolloData + 'T00:00:00')) : null);
      add('stampaPunteggi', v.stampaPunteggi);
    }
    if (this.graduatoriaPrivata()) {
      add('graduatoria_privata', 'true');
      add('protocollo_data', v.gpData);
      add('protocollo_numero', padProtocollo(v.gpNumero));
    }
    add('appellativo', v.appellativo);
    add('note', v.note);
    add('firma', v.firma);
    if (this.file) {
      data.append('file', this.file, this.file.name);
    }
    this.busy = true;
    this.communicationsService.generate(this.callId, this.kind, data).subscribe(count => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.generated');
      this.selected.clear();
      this.section = 'documents';
      this.stateFilter = '';
      this.loadDocuments();
    }, () => this.busy = false);
  }

  /* documenti */

  /** Carica tutti i documenti del tipo; il filtro per stato è applicato sul client. */
  loadDocuments(): void {
    this.documents = undefined;
    this.docSelected.clear();
    this.communicationsService.list(this.callId, this.kind)
      .subscribe(documents => this.documents = documents, () => this.documents = []);
  }

  setFilter(state: string): void {
    this.stateFilter = state;
    this.docSelected.clear();
  }

  visibleDocs(): any[] {
    return (this.documents || []).filter(d => !this.stateFilter || this.state(d) === this.stateFilter);
  }

  count(state: string): number {
    return (this.documents || []).filter(d => this.state(d) === state).length;
  }

  /** Stati presenti nei documenti, nell'ordine del flusso (gli stati non previsti vanno in fondo). */
  presentStates(): string[] {
    const present = Array.from(new Set((this.documents || []).map(d => this.state(d))));
    return present.sort((a, b) => this.order(a) - this.order(b));
  }

  private order(state: string): number {
    const i = this.stateOrder.indexOf(state);
    return i === -1 ? 99 : i;
  }

  /** Etichetta dello stato: traduzione se presente, altrimenti lo stato in forma leggibile. */
  stateLabel(state: string, singular = false): string {
    const key = (singular ? 'communications.state_one.' : 'communications.states.') + state;
    const label = this.translateService.instant(key);
    return label !== key ? label : state.charAt(0) + state.slice(1).toLowerCase();
  }

  /** Documenti a cui si applica un'azione: selezionati, oppure quelli mostrati, nello stato richiesto. */
  targets(state: string): string[] {
    const base = this.docSelected.size
      ? (this.documents || []).filter(d => this.docSelected.has(d['cmis:objectId']))
      : this.visibleDocs();
    return base.filter(d => this.state(d) === state).map(d => d['cmis:objectId']);
  }

  deletable(): string[] {
    return [...this.targets('GENERATO'), ...this.targets('FIRMATO')];
  }

  state(document: any): string {
    return document[STATE_PROPERTY[this.kind]] || 'GENERATO';
  }

  stateClass(state: string): string {
    return { GENERATO: 'bg-secondary', FIRMATO: 'bg-primary', SPEDITO: 'bg-success', CONSEGNATO: 'bg-success', RICEVUTO: 'bg-success' }[state] || 'bg-secondary';
  }

  toggleDoc(id: string): void {
    this.docSelected.has(id) ? this.docSelected.delete(id) : this.docSelected.add(id);
  }

  allDocsSelected(): boolean {
    const visible = this.visibleDocs();
    return visible.length > 0 && visible.every(d => this.docSelected.has(d['cmis:objectId']));
  }

  toggleAllDocs(checked: boolean): void {
    this.visibleDocs().forEach(d => checked ? this.docSelected.add(d['cmis:objectId']) : this.docSelected.delete(d['cmis:objectId']));
  }

  openSign(): void {
    this.modalRef = this.modalService.show(this.signTemplate, { class: 'modal-dialog-centered' });
  }

  openSend(): void {
    this.modalRef = this.modalService.show(this.sendTemplate, { class: 'modal-dialog-centered' });
  }

  sign(): void {
    this.busy = true;
    // come il legacy: la dicitura della firma è quella dell'utente collegato
    const user: any = this.authService.getUser() || {};
    const credentials = { ...this.signForm.value, firma: 'Firmato da ' + [user.firstName, user.lastName].filter(Boolean).join(' ') };
    this.communicationsService.sign(this.callId, this.kind, this.targets('GENERATO'), credentials).subscribe(count => {
      this.busy = false;
      this.modalRef?.hide();
      this.signForm.patchValue({ password: '', otp: '' });
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.signed');
      this.loadDocuments();
    }, () => this.busy = false);
  }

  send(): void {
    this.busy = true;
    this.communicationsService.send(this.callId, this.kind, this.sendable(), this.sendForm.value).subscribe(count => {
      this.busy = false;
      this.modalRef?.hide();
      this.sendForm.patchValue({ passwordPEC: '' });
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.sent');
      this.loadDocuments();
    }, () => this.busy = false);
  }

  deleteDocuments(): void {
    const ref = this.modalService.show(ModalConfirmComponent, {
      initialState: { body: 'communications.confirm_delete' }, class: 'modal-dialog-centered'
    });
    ref.content.confirm.subscribe(() => {
      this.busy = true;
      const requests = (['GENERATO', 'FIRMATO'] as CommunicationState[])
        .filter(st => this.targets(st).length)
        .map(st => this.communicationsService.delete(this.callId, this.kind, st, this.targets(st)));
      forkJoin(requests).subscribe(() => {
        this.busy = false;
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.deleted');
        this.loadDocuments();
      }, () => this.busy = false);
    });
  }

  /** Documenti che si possono inviare: generati (senza firma) e firmati. */
  sendable(): string[] {
    return [...this.targets('GENERATO'), ...this.targets('FIRMATO')];
  }

  /** Metadati del documento (tipo, stato, protocollo, destinatario). */
  view(document: any): void {
    this.documentService.getById(document['cmis:objectId']).subscribe(cmisObject =>
      this.modalService.show(ShowMetadataComponent, { initialState: { cmisObject }, class: 'modal-lg' }));
  }

  /** Modifica dei metadati (es. data e numero di protocollo) con la finestra dei documenti. */
  edit(document: any): void {
    this.documentService.getById(document['cmis:objectId']).subscribe(entity => {
      const ref = this.modalService.show(ManageDocumentComponent, { initialState: { entity, typeId: entity.objectTypeId }, class: 'modal-lg' });
      ref.content.event.subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.updated');
        this.loadDocuments();
      });
    });
  }

  /** Aggiorna il contenuto del documento (nuova versione), come "aggiorna" del legacy. */
  replace(document: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    input.value = '';
    if (!file) {
      return;
    }
    this.busy = true;
    this.operationsService.updateDocument(file, {
      'cmis:objectId': document['cmis:objectId'],
      'cmis:objectTypeId': document['cmis:objectTypeId']
    }).subscribe(() => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.updated');
      this.loadDocuments();
    }, () => this.busy = false);
  }

  deleteOne(document: any): void {
    const ref = this.modalService.show(ModalConfirmComponent, {
      initialState: { body: this.translateService.instant('message.document.delete.confirm', { value: document['cmis:name'] }) },
      class: 'modal-dialog-centered'
    });
    ref.content.confirm.subscribe(() => {
      this.busy = true;
      this.communicationsService.delete(this.callId, this.kind, this.state(document) as CommunicationState, [document['cmis:objectId']])
        .subscribe(() => {
          this.busy = false;
          this.apiMessageService.sendMessage(MessageType.SUCCESS, 'communications.deleted');
          this.loadDocuments();
        }, () => this.busy = false);
    });
  }

  download(document: any): void {
    this.callService.getBlob('/rest/content?nodeRef=' + document['cmis:objectId'], document['cmis:name']);
  }
}
