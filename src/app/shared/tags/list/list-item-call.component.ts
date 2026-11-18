import { ObjectType } from '../../../common/model/object-type.model';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Call} from '../../../core/call/call.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { CmisObject } from '../../../common/model/cmisobject.model';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../auth/auth.service';
import { ManageCallService } from '../../../core/call/manage-call.service';
import { ApiMessageService, MessageType } from '../../../core/api-message.service';
import { ModalConfirmComponent } from '../wizard/modal-confirm.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-list-item-call',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <article *ngIf="item" class="call-row card shadow-sm rounded mb-3" [ngClass]="'call-row--' + status()">
      <div class="row g-0">
        <!-- dati del bando -->
        <div class="col-lg-8 p-3 p-lg-4">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <a href="javascript:void(0)" class="badge rounded-pill call-type text-decoration-none"
               [itPopover]="(getMessageType(item) | translate) + ' ' + (item.objectTypeId | translate)" popoverTrigger="hover"
               (click)="changeType(item)">{{ (item.objectTypeId | translate) === item.objectTypeId ? readableType(item.objectTypeId) : (item.objectTypeId | translate) }}</a>
            <span class="badge rounded-pill" [ngClass]="statusClass()">{{ 'layout.status_' + status() | translate }}</span>
          </div>
          <h3 class="h5 mb-1 d-flex align-items-center">
            <a class="text-primary text-decoration-none" [routerLink]="['/call-detail']" [queryParams]="{ callCode: item.codice }">{{ item.codice }}</a>
            <button *ngIf="item.descrizione" type="button" class="btn btn-link p-0 ms-2" [itPopover]="translateService.currentLang == 'it' ? item.descrizione : item.descrizione_en" popoverTitle="Info" [popoverHtml]="true" popoverTrigger="focus" popoverPlacement="bottom"
                    [attr.aria-label]="'Info ' + item.codice">
              <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-info-circle"></use></svg>
            </button>
          </h3>
          <p *ngIf="item.profilo" class="mb-1 fw-semibold">{{ item.profilo }}</p>
          <p *ngIf="item.sede" class="mb-2 text-secondary">{{ item.sede }}</p>
          <div class="call-meta small text-secondary d-flex flex-wrap gap-3">
            <span *ngIf="item.numero_gu">G.U. n. {{ item.numero_gu }}<span *ngIf="item.data_gu"> del {{ item.data_gu | date:'dd/MM/yyyy' }}</span></span>
            <span *ngIf="item.numero_posti">{{ 'call.numero_posti' | translate }} <strong>{{ item.numero_posti }}</strong></span>
            <span *ngIf="item.numero_max_domande">{{ 'call.numero_max_domande' | translate }} <strong>{{ item.numero_max_domande }}</strong></span>
            <span *ngIf="item.elenco_macroaree">{{ item.elenco_macroaree }}</span>
            <span *ngIf="item.elenco_settori_tecnologici">{{ item.elenco_settori_tecnologici }}</span>
            <app-show-text-modal *ngIf="item.requisiti_link || item.requisiti_link_en"
              [label]="'call.elenco_titoli_studio'"
              [value]="translateService.currentLang == 'it' ? item.requisiti_link : item.requisiti_link_en"
              [modal_title]="'Info'"
              [modal_text]="translateService.currentLang == 'it' ? item.requisiti : item.requisiti_en"
              [strong]="false">
            </app-show-text-modal>
          </div>
          <app-call-prorogations [callId]="item.objectId" [compact]="true"></app-call-prorogations>
        </div>
        <!-- scadenza e azioni -->
        <div class="col-lg-4 p-3 p-lg-4 call-side d-flex flex-column">
          <div class="mb-3">
            <div class="small text-secondary">{{ (isExpired() ? 'call.data_fine_invio_domande_scaduto' : 'call.data_fine_invio_domande') | translate }}</div>
            <div class="h5 mb-0">{{ item.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm' }}</div>
            <div *ngIf="status() !== 'closed' && daysLeft() !== null" class="small" [ngClass]="status() === 'expiring' ? 'text-danger fw-semibold' : 'text-secondary'">
              {{ (daysLeft() === 0 ? 'layout.status_today' : 'layout.status_days_left') | translate:{value: daysLeft()} }}
            </div>
          </div>
          <div class="mt-auto">
            <app-call-actions [item]="item" mode="compact" (changed)="onChange.emit()"></app-call-actions>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .call-row { border-left: 4px solid var(--bs-primary, #0066cc); transition: box-shadow .15s ease; }
    .call-row::after { display: none; }
    .call-row:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.12) !important; }
    .call-row--expiring { border-left-color: #cc7a00; }
    .call-row--closed { border-left-color: #a0a8b0; }
    .call-type { background: #e6f0fa; color: #0066cc; font-weight: 600; }
    .call-side { background: #f7f9fc; border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
    @media (min-width: 992px) { .call-side { border-left: 1px solid #e3e8ee; } }
    .call-meta :is(span, app-show-text-modal) { white-space: nowrap; }
  `]
})
export class ListItemCallComponent {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private manageCallService: ManageCallService,
              private modalService: ModalService,
              private apiMessageService: ApiMessageService,
              public translateService: TranslateService) {}

  /** Emesso dopo pubblicazione/ritiro o eliminazione, per ricaricare l'elenco. */
  @Output() onChange = new EventEmitter();

  /** Stato del bando: aperto, in scadenza (ultimi 7 giorni), chiuso. */
  public status(): 'open' | 'expiring' | 'closed' {
    if (!this.isActive()) {
      return 'closed';
    }
    const days = this.daysLeft();
    return days !== null && days <= 7 ? 'expiring' : 'open';
  }

  public statusClass(): string {
    return { open: 'bg-success', expiring: 'bg-warning text-dark', closed: 'bg-secondary' }[this.status()];
  }

  public daysLeft(): number {
    const end = this.item && this.item.data_fine_invio_domande ? new Date(this.item.data_fine_invio_domande as any).getTime() : NaN;
    if (isNaN(end)) {
      return null;
    }
    return Math.max(Math.floor((end - Date.now()) / 86400000), 0);
  }

  public readableType(key: string): string {
    return ObjectType.readable(key);
  }

  public isManager(): boolean {
    return ManageCallService.isManager(this.authService.getUser(), this.item);
  }

  public isConcorsi(): boolean {
    return ManageCallService.isConcorsi(this.authService.getUser());
  }

  public isMacroCall(): boolean {
    return ManageCallService.isMacroCall(this.item);
  }

  public publish() {
    const publish = !this.item.pubblicato;
    this.confirm(publish ? 'call_manage.confirm_publish' : 'call_manage.confirm_unpublish', () =>
      this.manageCallService.publish(this.item.objectId, publish).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS,
          publish ? 'call_manage.published_done' : 'call_manage.unpublished_done');
        this.onChange.emit();
      }));
  }

  public deleteCall() {
    this.confirm('call_manage.confirm_delete', () =>
      this.manageCallService.deleteCall(this.item.objectId).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.deleted');
        this.onChange.emit();
      }));
  }

  private confirm(body: string, action: () => void) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() => action());
  }

  @Input() item: Call = null;

  @Output() onDelete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  public newApplication() {
    this.router.navigate(['/manage-application'],
      {
        relativeTo: this.route,
        queryParams: { callId: this.item.getObjectId()}
      });
  }

  /** Il termine di presentazione delle domande è passato (diverso da "non ancora aperto"). */
  public isExpired(): boolean {
    return !!this.item?.data_fine_invio_domande && new Date() > new Date(this.item.data_fine_invio_domande);
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.data_inizio_invio_domande) && now <= new Date(this.item.data_fine_invio_domande);
  }

  public canCreateDocument(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
  }

  public canUpdateCall(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_UPDATE_PROPERTIES) !== -1;
  }

  public getMessageType(item: CmisObject): string {
    let type = item.objectTypeId.substr(2);
    if (this.filterForm.controls.type.value === type) {
      return 'call.remove_filter_for_code';
    } else {
      return 'call.filter_for_code';
    }
  }

  public changeType(item: CmisObject) {
    let type = item.objectTypeId.substr(2);
    if (this.filterForm.controls.type.value === type) {
      this.filterForm.controls.type.patchValue('jconon_call:folder');
    } else {
      this.filterForm.controls.type.patchValue(type);
    }
  }
}
