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

const SCHEDA_TYPE = 'D:jconon_attachment:scheda_valutazione';
const COMMENTO = 'jconon_attachment:scheda_valutazione_commento';

/**
 * Scheda di valutazione della domanda (ex pagina scheda-valutazione del legacy): la commissione la predispone
 * (foglio Excel vuoto generato dal backend), la scarica, la compila e la ricarica come nuova versione con un commento.
 */
@Component({
  selector: 'app-application-evaluation-modal',
  standalone: true,
  imports: [FormsModule, TranslatePipe, UpperCasePipe, DatePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>
        {{ 'application_operations.evaluation.title' | translate }}
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

      @if (loading) {
        <p class="text-secondary">{{ 'layout.loading' | translate }}</p>
      } @else if (!scheda) {
        <div class="alert alert-info">{{ 'application_operations.evaluation.missing' | translate }}</div>
        <button type="button" class="btn btn-primary btn-sm" [disabled]="busy" (click)="create()">
          {{ 'application_operations.evaluation.create' | translate }}
        </button>
      } @else {
        <h3 class="h6">{{ 'application_operations.evaluation.versions' | translate }}</h3>
        <ul class="list-unstyled versions mb-4">
          @for (version of versions; track version['cmis:objectId']; let first = $first) {
            <li class="d-flex align-items-start gap-3 py-2">
              <span class="badge" [class.bg-primary]="first" [class.bg-secondary]="!first">{{ version['cmis:versionLabel'] }}</span>
              <div class="me-auto small">
                <div>
                  {{ version['jconon_attachment:user'] || version['cmis:lastModifiedBy'] }},
                  {{ version['cmis:lastModificationDate'] | date:'dd/MM/yyyy HH:mm' }}
                </div>
                @if (version[COMMENTO]) {
                  <div class="text-secondary">{{ version[COMMENTO] }}</div>
                }
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="download(version)"
                      [attr.aria-label]="'application_operations.evaluation.download' | translate">
                <svg class="icon icon-primary icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
              </button>
            </li>
          }
        </ul>

        <div class="card card-bg p-3">
          <h3 class="h6">{{ 'application_operations.evaluation.upload' | translate }}</h3>
          <input type="file" class="form-control mb-2" accept=".xls,.xlsx,.pdf" (change)="onFile($event)"
                 [attr.aria-label]="'application_operations.evaluation.upload' | translate">
          <label for="ev-comment" class="form-label fw-semibold">{{ 'application_operations.evaluation.comment' | translate }} *</label>
          <textarea id="ev-comment" rows="2" class="form-control" [(ngModel)]="comment"></textarea>
          <div class="d-flex justify-content-between mt-3">
            <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="busy" (click)="remove()">
              {{ 'application_operations.evaluation.delete' | translate }}
            </button>
            <button type="button" class="btn btn-primary btn-sm" [disabled]="busy || !file || !comment.trim()" (click)="upload()">
              {{ 'application_operations.evaluation.save_version' | translate }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .candidate { padding: .6rem .9rem; background: #f0f6fc; border-left: 4px solid #0066cc; border-radius: 4px; }
    .versions li + li { border-top: 1px solid #e3e8ee; }
  `]
})
export class ApplicationEvaluationModalComponent implements OnInit {
  public readonly COMMENTO = COMMENTO;
  public application: Application;

  public scheda: any;
  public versions: any[] = [];
  public loading = true;
  public busy = false;
  public file: File;
  public comment = '';

  public readonly modalRef = inject(ModalRef);
  private readonly service = inject(ApplicationOperationsService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.service.children(this.application.objectId, 'jconon_attachment:scheda_valutazione').subscribe(items => {
      this.scheda = items.length ? items[0] : null;
      if (!this.scheda) {
        this.loading = false;
        return;
      }
      this.service.versions(this.scheda['cmis:versionSeriesId'] || this.scheda['cmis:objectId']).subscribe(versions => {
        this.versions = versions;
        this.loading = false;
      }, () => this.loading = false);
    }, () => this.loading = false);
  }

  create(): void {
    this.busy = true;
    this.service.createEvaluation(this.application.objectId).subscribe(() => {
      this.busy = false;
      this.load();
    }, () => this.busy = false);
  }

  download(version: any): void {
    this.service.download(version['cmis:objectId'], version['cmis:name'] || 'scheda.xls').subscribe();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : null;
  }

  upload(): void {
    const user = this.authService.getUser();
    this.busy = true;
    this.service.updateDocument(this.file, {
      'cmis:objectId': this.scheda['cmis:versionSeriesId'] || this.scheda['cmis:objectId'],
      'cmis:objectTypeId': SCHEDA_TYPE,
      'jconon_attachment:user': user ? user.userName : null,
      [COMMENTO]: this.comment.trim()
    }).subscribe(() => {
      this.busy = false;
      this.file = null;
      this.comment = '';
      this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('application_operations.evaluation.saved'));
      this.load();
    }, () => this.busy = false);
  }

  remove(): void {
    const ref = this.modalService.show(ModalConfirmComponent, {
      initialState: { body: 'application_operations.evaluation.confirm_delete' }, class: 'modal-dialog-centered'
    });
    ref.content.confirm.subscribe(() => {
      this.busy = true;
      this.service.deleteDocument(this.scheda['cmis:versionSeriesId'] || this.scheda['cmis:objectId']).subscribe(() => {
        this.busy = false;
        this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('application_operations.evaluation.deleted'));
        this.load();
      }, () => this.busy = false);
    });
  }
}
