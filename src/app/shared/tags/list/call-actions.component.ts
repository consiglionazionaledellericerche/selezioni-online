import { CallAttachmentsModalComponent } from '../../../dynamic/affix/call-attachments-modal.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Call } from '../../../core/call/call.model';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { AuthService } from '../../../auth/auth.service';
import { ManageCallService } from '../../../core/call/manage-call.service';
import { ApiMessageService, MessageType } from '../../../core/api-message.service';
import { ModalService } from '../../modal/modal.service';
import { ModalConfirmComponent } from '../wizard/modal-confirm.component';
import { ExportApplicationsComponent } from '../../../core/call/shared/export-applications.component';

interface ManageAction {
  label: string;
  icon: string;
  route?: string;
  queryParams?: any;
  action?: () => void;
  danger?: boolean;
}

/**
 * Tutte le azioni su un bando, usate sia nelle righe dell'elenco (mode="compact": pulsante principale,
 * pulsanti icona e menu "altre azioni") sia nella pagina di dettaglio (mode="panel": azioni di gestione
 * elencate per esteso). Le operazioni sono definite una sola volta in manageActions().
 */
@Component({
  standalone: false,
  selector: 'app-call-actions',
  template: `
    <ng-container *ngIf="item">
      <div class="d-flex flex-wrap align-items-center gap-2" [ngClass]="{ 'mb-2': mode === 'panel' }">
        <a *ngIf="isActive()" class="btn btn-primary" [ngClass]="mode === 'panel' ? 'w-100' : 'btn-sm'" href="javascript:" (click)="newApplication()">
          <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>
          {{ 'call.submit_application' | translate }}
        </a>
        <a *ngIf="mode === 'compact' && canCreateDocument()" class="btn btn-outline-primary btn-sm btn-action" [routerLink]="['/applications-user']"
           [queryParams]="{ callId: item.objectId }" [itTooltip]="'call.menuitem.application' | translate">
          <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-files"></use></svg>
          <span class="visually-hidden">{{ 'call.menuitem.application' | translate }}</span>
        </a>
        <button *ngIf="mode === 'compact' && canCreateDocument()" type="button" class="btn btn-outline-primary btn-sm btn-action"
                (click)="openExport()" [itTooltip]="'export.menu' | translate">
          <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>
          <span class="visually-hidden">{{ 'export.menu' | translate }}</span>
        </button>
        <a *ngIf="mode === 'compact' && canUpdateCall()" class="btn btn-outline-primary btn-sm btn-action" [routerLink]="['/manage-call']"
           [queryParams]="{ 'cmis:objectId': item.objectId, 'call-type': item.objectTypeId }"
           [itTooltip]="'call.menuitem.update' | translate">
          <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-settings"></use></svg>
          <span class="visually-hidden">{{ 'call.menuitem.update' | translate }}</span>
        </a>
        <app-show-children-modal *ngIf="mode === 'compact' && !canUpdateCall()" [parentId]="item.objectId" [modal_title]="'call.attach_to' | translate:{value: item.codice}">
        </app-show-children-modal>
        <!-- chi può modificare il bando: stessa gestione degli allegati della modifica del bando -->
        <button *ngIf="mode === 'compact' && canUpdateCall()" type="button" class="btn btn-outline-primary btn-sm btn-action"
                (click)="openAttachments()" [itTooltip]="'attach' | translate">
          <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clip"></use></svg>
          <span class="visually-hidden">{{ 'attach' | translate }}</span>
        </button>
        <it-dropdown *ngIf="mode === 'compact' && manageActions().length" mode="button" color="secondary" class="more-actions">
          <span button class="d-inline-flex align-items-center" [itTooltip]="'more.actions' | translate">
            <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-more-items"></use></svg>
            <span class="visually-hidden">{{ 'more.actions' | translate }}</span>
          </span>
          <ng-container list>
            <li *ngFor="let a of manageActions()">
              <a *ngIf="a.route" class="dropdown-item list-item" [routerLink]="[a.route]" [queryParams]="a.queryParams">
                <svg class="icon icon-sm icon-primary me-2"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + a.icon"></use></svg>{{ a.label | translate }}
              </a>
              <a *ngIf="!a.route" class="dropdown-item list-item" [class.text-danger]="a.danger" href="javascript:" (click)="a.action()">
                <svg class="icon icon-sm me-2" [ngClass]="a.danger ? 'icon-danger' : 'icon-primary'"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + a.icon"></use></svg>{{ a.label | translate }}
              </a>
            </li>
          </ng-container>
        </it-dropdown>
      </div>

      <ul *ngIf="mode === 'panel'" class="list-unstyled mb-3 manage-list">
        <li *ngIf="canCreateDocument()">
          <a [routerLink]="['/applications-user']" [queryParams]="{ callId: item.objectId }">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-files"></use></svg>{{ 'call.menuitem.application' | translate }}
          </a>
        </li>
        <li *ngIf="canCreateDocument()">
          <a href="javascript:void(0)" (click)="openExport()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>{{ 'export.menu' | translate }}
          </a>
        </li>
        <li *ngIf="canUpdateCall()">
          <a [routerLink]="['/manage-call']" [queryParams]="{ 'cmis:objectId': item.objectId, 'call-type': item.objectTypeId }">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-settings"></use></svg>{{ 'call.menuitem.update' | translate }}
          </a>
        </li>
        <li>
          <app-show-children-modal *ngIf="!canUpdateCall()" variant="link" linkLabel="layout.call_documents" [parentId]="item.objectId"
            [modal_title]="'call.attach_to' | translate:{value: item.codice}"></app-show-children-modal>
          <a *ngIf="canUpdateCall()" href="javascript:void(0)" class="action-link" (click)="openAttachments()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clip"></use></svg>{{ 'layout.call_documents' | translate }}
          </a>
        </li>
      </ul>
      <ng-container *ngIf="mode === 'panel' && manageActions().length">
        <h2 class="panel-title mt-2">{{ 'call_manage.panel_title' | translate }}</h2>
        <ul class="list-unstyled mb-0 manage-list">
          <li *ngFor="let a of manageActions()">
            <a *ngIf="a.route" [routerLink]="[a.route]" [queryParams]="a.queryParams">
              <svg class="icon icon-sm icon-primary me-2"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + a.icon"></use></svg>{{ a.label | translate }}
            </a>
            <a *ngIf="!a.route" href="javascript:" [class.text-danger]="a.danger" (click)="a.action()">
              <svg class="icon icon-sm me-2" [ngClass]="a.danger ? 'icon-danger' : 'icon-primary'"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + a.icon"></use></svg>{{ a.label | translate }}
            </a>
          </li>
        </ul>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    .panel-title { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    .manage-list a, .manage-list ::ng-deep .action-link { display: flex; align-items: center; padding: .45rem .5rem; border-radius: 4px; text-decoration: none; color: #17324d; }
    .manage-list a:hover, .manage-list ::ng-deep .action-link:hover { background: #f0f6fc; }
    .manage-list a.text-danger { color: #d9364f; }
  `]
})
export class CallActionsComponent {
  @Input() item: Call;
  @Input() mode: 'compact' | 'panel' = 'compact';
  /** Emesso dopo pubblicazione/ritiro (per ricaricare il bando). */
  @Output() changed = new EventEmitter<void>();
  /** Emesso dopo l'eliminazione del bando. */
  @Output() deleted = new EventEmitter<void>();

  private cachedFor: Call;
  private cached: ManageAction[] = [];

  constructor(private router: Router,
              private authService: AuthService,
              private manageCallService: ManageCallService,
              private modalService: ModalService,
              private apiMessageService: ApiMessageService) {}

  /** Operazioni di gestione (menu "altre azioni" nelle righe, elenco esteso nel dettaglio). */
  manageActions(): ManageAction[] {
    if (this.cachedFor === this.item && this.cachedPublished === this.item?.pubblicato) {
      return this.cached;
    }
    this.cachedFor = this.item;
    this.cachedPublished = this.item?.pubblicato;
    if (!this.item) {
      return this.cached = [];
    }
    const id = this.item.objectId;
    // punteggi: anche per la commissione, che ha CAN_CREATE_DOCUMENT sul bando ma non ne gestisce le impostazioni
    const scores: ManageAction = { label: 'call_scores.title', icon: 'it-star-outline', route: '/call-scores', queryParams: { callId: id } };
    if (!this.canUpdateCall() || !this.isManager()) {
      return this.cached = this.canCreateDocument() && this.isExpired() ? [scores] : [];
    }
    const actions: ManageAction[] = [
      { label: this.item.pubblicato ? 'call_manage.unpublish' : 'call_manage.publish',
        icon: this.item.pubblicato ? 'it-password-invisible' : 'it-horn', action: () => this.publish() },
      { label: 'call_manage.commission.title', icon: 'it-user', route: '/call-commission', queryParams: { callId: id } },
      { label: 'call_manage.labels.title', icon: 'it-bookmark', route: '/call-labels', queryParams: { callId: id } },
      { label: 'communications.kind.convocazioni', icon: 'it-calendar', route: '/call-communications', queryParams: { callId: id, kind: 'convocazioni' } },
      { label: 'communications.kind.esclusioni', icon: 'it-ban', route: '/call-communications', queryParams: { callId: id, kind: 'esclusioni' } },
      { label: 'communications.kind.comunicazioni', icon: 'it-mail', route: '/call-communications', queryParams: { callId: id, kind: 'comunicazioni' } },
      scores,
      { label: 'call_attachment.title', icon: 'it-clip', route: '/call-application-attachment', queryParams: { callId: id } }
    ];
    if (ManageCallService.isConcorsi(this.authService.getUser())) {
      actions.push({ label: 'call_manage.permissions.title', icon: 'it-key', route: '/call-permissions', queryParams: { callId: id } });
    }
    if (ManageCallService.isMacroCall(this.item)) {
      actions.push({ label: 'call_manage.children.title', icon: 'it-folder', route: '/call-children', queryParams: { callId: id } });
    }
    actions.push(
      { label: 'call_manage.copy.button', icon: 'it-copy', route: '/manage-call', queryParams: { 'call-type': this.item.objectTypeId, copyFrom: id } },
      { label: 'delete', icon: 'it-delete', danger: true, action: () => this.deleteCall() }
    );
    return this.cached = actions;
  }
  private cachedPublished: boolean;

  isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.data_inizio_invio_domande) && now <= new Date(this.item.data_fine_invio_domande);
  }

  /** Termine di presentazione delle domande passato: punteggi e graduatoria hanno senso solo dopo. */
  isExpired(): boolean {
    return !!this.item.data_fine_invio_domande && new Date() > new Date(this.item.data_fine_invio_domande);
  }

  canCreateDocument(): boolean {
    return (this.item.allowableActions || []).indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
  }

  canUpdateCall(): boolean {
    return (this.item.allowableActions || []).indexOf(AllowableAction.CAN_UPDATE_PROPERTIES) !== -1;
  }

  isManager(): boolean {
    return ManageCallService.isManager(this.authService.getUser(), this.item);
  }

  newApplication(): void {
    this.router.navigate(['/manage-application'], { queryParams: { callId: this.item.getObjectId() } });
  }

  publish(): void {
    const publish = !this.item.pubblicato;
    this.confirm(publish ? 'call_manage.confirm_publish' : 'call_manage.confirm_unpublish', () =>
      this.manageCallService.publish(this.item.objectId, publish).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, publish ? 'call_manage.published_done' : 'call_manage.unpublished_done');
        this.item.pubblicato = publish;
        this.changed.emit();
      }));
  }

  deleteCall(): void {
    this.confirm('call_manage.confirm_delete', () =>
      this.manageCallService.deleteCall(this.item.objectId).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.deleted');
        this.deleted.emit();
        this.changed.emit();
      }));
  }

  openExport(): void {
    this.modalService.show(ExportApplicationsComponent, { initialState: { call: this.item }, class: 'modal-lg' });
  }

  /** Allegati del bando con la gestione completa (tipologie, caricamento, modifica), come nella modifica del bando. */
  openAttachments(): void {
    this.modalService.show(CallAttachmentsModalComponent, { initialState: { call: this.item }, class: 'modal-xl' });
  }

  private confirm(body: string, action: () => void): void {
    const ref = this.modalService.show(ModalConfirmComponent, { initialState: { body }, class: 'modal-dialog-centered' });
    ref.content.confirm.subscribe(() => action());
  }
}
