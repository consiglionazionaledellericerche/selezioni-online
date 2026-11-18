import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalRef, ModalService } from '../../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../../shared/tags/wizard/modal-confirm.component';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { AuthService } from '../../../auth/auth.service';
import { Application } from '../application.model';
import { ApplicationOperationsService } from '../application-operations.service';

const WINNER_ASPECT = 'P:jconon_call_aspect_winner:attachment';

/**
 * Documenti richiesti al vincitore (ex pulsante "winner" del legacy): attivi quando il bando ha la finestra
 * di caricamento aperta (jconon_call_aspect_winner:active) e la domanda ha esito V. Le tipologie ammesse
 * sono quelle indicate nel bando (jconon_call_aspect_winner:elenco_file).
 */
@Component({
  selector: 'app-application-winner-modal',
  standalone: true,
  imports: [FormsModule, TranslatePipe, UpperCasePipe, DatePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon icon-success me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-inbox"></use></svg>
        {{ 'application_operations.winner.title' | translate }}
      </h2>
      <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3">
      <div class="candidate mb-3">
        <span class="small text-secondary d-block">{{ 'application_operations.candidate' | translate }}</span>
        <strong>{{ application.cognome | uppercase }} {{ application.nome | uppercase }}</strong>
        @if (application.call?.codice) {
          <span class="small text-secondary"> — {{ application.call.codice }}</span>
        }
      </div>
      <p class="small text-secondary">{{ 'application_operations.winner.info' | translate }}</p>

      <h3 class="h6">{{ 'application_operations.winner.uploaded' | translate }}</h3>
      @if (loading) {
        <p class="text-secondary">{{ 'layout.loading' | translate }}</p>
      } @else if (!documents.length) {
        <div class="alert alert-light">{{ 'application_operations.winner.empty' | translate }}</div>
      } @else {
        <ul class="list-unstyled documents mb-4">
          @for (doc of documents; track doc['cmis:objectId']) {
            <li class="d-flex align-items-center gap-2 py-2">
              <div class="me-auto">
                <div class="fw-semibold">{{ doc['cmis:objectTypeId'] | translate }}</div>
                <div class="small text-secondary">{{ doc['cmis:name'] }} — {{ doc['cmis:creationDate'] | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="download(doc)"
                      [attr.aria-label]="'application_operations.evaluation.download' | translate">
                <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
              </button>
              @if (canDelete(doc)) {
                <button type="button" class="btn btn-outline-danger btn-sm btn-action" (click)="remove(doc)"
                        [attr.aria-label]="'delete' | translate">
                  <svg class="icon icon-danger icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>
                </button>
              }
            </li>
          }
        </ul>
      }

      <div class="card card-bg p-3">
        <h3 class="h6">{{ 'application_operations.winner.add' | translate }}</h3>
        @if (!types.length) {
          <div class="alert alert-warning mb-0">{{ 'application_operations.winner.no_types' | translate }}</div>
        } @else {
          <label for="win-type" class="form-label fw-semibold">{{ 'application_operations.winner.type' | translate }} *</label>
          <select id="win-type" class="form-select mb-2" [(ngModel)]="type">
            @for (t of types; track t) {
              <option [value]="t">{{ t | translate }}</option>
            }
          </select>
          <input type="file" class="form-control" (change)="onFile($event)" [attr.aria-label]="'application_operations.file' | translate">
          <div class="text-end mt-3">
            <button type="button" class="btn btn-primary btn-sm" [disabled]="busy || !file || !type" (click)="upload()">
              {{ 'application_operations.winner.upload' | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .candidate { padding: .6rem .9rem; background: #f0f6fc; border-left: 4px solid #008758; border-radius: 4px; }
    .documents li + li { border-top: 1px solid #e3e8ee; }
  `]
})
export class ApplicationWinnerModalComponent implements OnInit {
  public application: Application;

  public documents: any[] = [];
  public types: string[] = [];
  public type: string;
  public file: File;
  public loading = true;
  public busy = false;

  public readonly modalRef = inject(ModalRef);
  private readonly service = inject(ApplicationOperationsService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    const elenco = this.application.call ? this.application.call.winner_elenco_file : null;
    this.types = Array.isArray(elenco) ? elenco : (elenco ? [elenco] : []);
    this.type = this.types[0];
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.service.children(this.application.objectId, 'jconon_call_aspect_winner:attachment').subscribe(items => {
      this.documents = items;
      this.loading = false;
    }, () => this.loading = false);
  }

  canDelete(doc: any): boolean {
    // proprietà grezze dal backend: le azioni sono stringhe
    return (doc.allowableActions || []).indexOf('CAN_DELETE_OBJECT') !== -1;
  }

  download(doc: any): void {
    this.service.download(doc['cmis:objectId'], doc['cmis:name'] || 'documento').subscribe();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : null;
  }

  upload(): void {
    const user = this.authService.getUser();
    this.busy = true;
    this.service.createDocument(this.application.objectId, this.file, {
      'cmis:objectTypeId': this.type,
      'aspect': [WINNER_ASPECT],
      'jconon_attachment:user': user ? user.userName : null
    }).subscribe(() => {
      this.busy = false;
      this.file = null;
      this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('application_operations.winner.done'));
      this.load();
    }, () => this.busy = false);
  }

  remove(doc: any): void {
    const ref = this.modalService.show(ModalConfirmComponent, {
      initialState: { body: 'application_operations.winner.confirm_delete' }, class: 'modal-dialog-centered'
    });
    ref.content.confirm.subscribe(() => {
      this.service.deleteDocument(doc['cmis:objectId']).subscribe(() => this.load());
    });
  }
}
