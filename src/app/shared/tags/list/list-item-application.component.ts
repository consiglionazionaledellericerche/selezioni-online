import { ManageCallService } from '../../../core/call/manage-call.service';
import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Application} from '../../../core/application/application.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { User } from '../../../auth/model/user.model';
import { PrintApplicationComponent } from '../../../core/application/print-application.component';
import { ModalService } from '../../modal/modal.service';

@Component({
  standalone: false,
  selector: 'app-list-item-application',
  template: `
    <article *ngIf="item" class="app-row card shadow-sm rounded mb-3" [ngClass]="'app-row--' + (item.isProvvisoria() ? 'draft' : 'sent')">
      <div class="row g-0">
        <!-- dati della domanda -->
        <div class="col-lg-8 p-3 p-lg-4">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge rounded-pill" [ngClass]="item.isProvvisoria() ? 'bg-warning text-dark' : 'bg-success'">
              {{ 'application.state.' + item.stato_domanda | translate }}
            </span>
            <span *ngIf="showEsclusione()" class="badge rounded-pill" [ngClass]="item.isSospesa() ? 'bg-warning text-dark' : 'bg-danger'">
              {{ 'application.esclusione.' + item.esclusione_rinuncia | translate }}
            </span>
          </div>
          <ng-content></ng-content>
        </div>
        <!-- date e azioni -->
        <div class="col-lg-4 p-3 p-lg-4 app-side d-flex flex-column">
          <div class="mb-3">
            <div class="small text-secondary">{{ (item.isProvvisoria() ? 'layout.application_modified' : 'layout.application_sent') | translate }}</div>
            <div class="h6 mb-1">{{ (item.isProvvisoria() ? item.lastModificationDate : item.data_domanda) | date:'dd/MM/yyyy HH:mm' }}</div>
            <div *ngIf="item.call?.data_fine_invio_domande" class="small" [ngClass]="isActive ? 'text-secondary' : 'text-danger'">
              {{ (isExpired ? 'call.data_fine_invio_domande_scaduto' : 'call.data_fine_invio_domande') | translate }} {{ item.call.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm' }}
            </div>
          </div>
          <div class="mt-auto d-flex flex-wrap align-items-center gap-2">
            <a *ngIf="(isActive && isDomandaProvvisoria) || user?.capabilities?.isAdmin" class="btn btn-primary btn-sm" href="javascript:"
               (click)="newApplication()">
              <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>
              {{ 'application.edit' | translate }}
            </a>
            <a *ngIf="isActive && isDomandaConfermata" class="btn btn-outline-primary btn-sm" href="javascript:"
               (click)="reopenApplication()">
              <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-exchange-circle"></use></svg>
              {{ 'application.reopen' | translate }}
            </a>
            <button type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="printApplication()"
                    [itTooltip]="'application.print.application' | translate">
              <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-print"></use></svg>
              <span class="visually-hidden">{{ 'application.print.application' | translate }}</span>
            </button>
            <button *ngIf="canZip()" type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="downloadZip()"
                    [disabled]="zipping" [itTooltip]="'application.download_zip' | translate">
              <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-compressed"></use></svg>
              <span class="visually-hidden">{{ 'application.download_zip' | translate }}</span>
            </button>
            <button *ngIf="canCopy" type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="copyApplication()"
                    [itTooltip]="'application.copy' | translate">
              <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-copy"></use></svg>
              <span class="visually-hidden">{{ 'application.copy' | translate }}</span>
            </button>
            <app-show-children-modal
              [show_date]="'true'"
              [typeId]="'P:jconon_attachment:generic_document'"
              [queryName]="'jconon_attachment:generic_document'"
              [parentId]="item.objectId"
              [modal_title]="'application.attach_to' | translate">
            </app-show-children-modal>
          </div>
        </div>
      </div>
    </article>
    `,
  styles: [`
    .app-row { border-left: 4px solid #008758; transition: box-shadow .15s ease; }
    .app-row::after { display: none; }
    .app-row:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.12) !important; }
    .app-row--draft { border-left-color: #cc7a00; }
    .app-side { background: #f7f9fc; border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
    @media (min-width: 992px) { .app-side { border-left: 1px solid #e3e8ee; } }
  `],

})
export class ListItemApplicationComponent {

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private modalService: ModalService,
    private manageCallService: ManageCallService,
  ) {}

  @Input() item: Application = null;

  @Input() user: User;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() onReopen = new EventEmitter();

  @Output() onCopy = new EventEmitter();

  /** Abilita la voce "Copia domanda": va attivata solo dove l'utente e' il titolare della domanda. */
  @Input() canCopy = false;

  @Input() filterForm;

  @Input() page;

  public newApplication() {
    this.router.navigate(['/manage-application'],
      {
        relativeTo: this.route,
        queryParams: { 
          callId: this.item.call.getObjectId(), 
          applicationId: this.item.getObjectId()
        }
      });
  }

  public reopenApplication() {
    this.onReopen.emit();
  }

  public copyApplication() {
    this.onCopy.emit();
  }

  public printApplication() {
    const initialState = {
      'application': this.item
    };
    this.modalService.show(PrintApplicationComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-left' }));
  }

  public canEditApplication(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
  }

  /** Esclusione, rinuncia o sospensione visibili all'utente (come in precedenza nei template delle liste). */
  public showEsclusione(): boolean {
    try {
      return !!this.item.esclusione_rinuncia && this.item.isShowEsclusioneRiununcia(this.user);
    } catch (e) {
      return !!this.item.esclusione_rinuncia;
    }
  }

  public zipping = false;

  /** Zip della domanda confermata: per il candidato titolare e per chi la vede nelle domande dei candidati. */
  public canZip(): boolean {
    return !!this.item && !this.item.isProvvisoria() && this.item.stato_domanda === 'C';
  }

  public downloadZip(): void {
    this.zipping = true;
    this.manageCallService.exportApplicationZip(this.item.objectId).subscribe(
      () => this.zipping = false,
      () => this.zipping = false);
  }

  get isExpired(): boolean {
    return !!this.item?.call?.data_fine_invio_domande && new Date() > new Date(this.item.call.data_fine_invio_domande);
  }

  get isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.call.data_inizio_invio_domande) && now <= new Date(this.item.call.data_fine_invio_domande);
  }

  get isDomandaProvvisoria(): boolean {
    return this.item.isProvvisoria();
  }

  get isDomandaConfermata(): boolean {
    return this.item.isConfermata();
  }

  buttonStyle() {
    return {
      'position': 'absolute',
      'top': '5px',
      'right': '5px'
    };
  }
}
