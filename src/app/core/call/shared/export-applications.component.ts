import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Call } from '../call.model';
import { ManageCallService } from '../manage-call.service';
import { CallCommunicationsService } from '../call-communications.service';
import { ModalRef } from '../../../shared/modal/modal.service';
import { MultiSelectComponent, MultiSelectOption } from '../../../shared/ui/multi-select.component';
import { ApiMessageService, MessageType } from '../../api-message.service';

/**
 * Esportazioni delle domande di un bando: elenco in Excel e "Estrazione domande relative al bando" in zip
 * (solo domande, confermate con allegati, attive con allegati; filtri opzionali per tipi di allegato e domande).
 */
@Component({
  selector: 'app-export-applications',
  standalone: true,
  imports: [NgClass, FormsModule, TranslatePipe, MultiSelectComponent],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc">{{ 'export.title' | translate }} {{ call?.codice }}</h2>
      <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3 pb-4">
      <section class="mb-4">
        <h3 class="h6 text-primary">{{ 'export.excel' | translate }}</h3>
        <p class="small text-secondary">{{ 'export.excel_info' | translate }}</p>
        <div class="d-flex flex-wrap align-items-end gap-3">
          <div class="select-wrapper flex-grow-1 mb-0">
            <label for="xls-status">{{ 'layout.filter_application_state' | translate }}</label>
            <select id="xls-status" [(ngModel)]="xlsStatus">
              <option value="sent">{{ 'export.status.sent' | translate }}</option>
              <option value="active">{{ 'export.status.active' | translate }}</option>
              <option value="temporary">{{ 'export.status.temporary' | translate }}</option>
              <option value="all">{{ 'export.status.all' | translate }}</option>
            </select>
          </div>
          <button type="button" class="btn btn-success" [disabled]="busy" (click)="excel()">
            <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>
            {{ 'export.download_excel' | translate }}
          </button>
        </div>
      </section>
      <section class="border-top pt-3">
        <h3 class="h6 text-primary">{{ 'export.zip' | translate }}</h3>
        <p class="small text-secondary">{{ 'export.zip_info' | translate }}</p>
        <div class="mb-3">
          <span class="small fw-semibold d-block mb-1">{{ 'export.types' | translate }}</span>
          <app-multi-select [options]="typeOptions" [values]="types" (valuesChange)="types = $event"
            placeholder="export.all_types"></app-multi-select>
        </div>
        <div class="mb-3">
          <span class="small fw-semibold d-block mb-1">{{ 'export.applications' | translate }}</span>
          <app-multi-select [options]="applicationOptions" [values]="applications" (valuesChange)="applications = $event"
            placeholder="export.all_applications"></app-multi-select>
        </div>
        @if (busy) {
          <div class="d-flex align-items-center gap-2 mt-3 small text-secondary">
            <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'export.working' | translate }}
          </div>
        }
      </section>
    </div>
    <div class="modal-footer d-flex flex-wrap justify-content-end gap-2">
      <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="busy" (click)="zip(false, false)">{{ 'export.only_applications' | translate }}</button>
      <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="busy" (click)="zip(true, false)">{{ 'export.confirmed_with_attachments' | translate }}</button>
      <button type="button" class="btn btn-primary btn-sm" [disabled]="busy" (click)="zip(true, true)">{{ 'export.active_with_attachments' | translate }}</button>
    </div>
  `,
})
export class ExportApplicationsComponent implements OnInit {
  public call: Call;
  public xlsStatus: 'all' | 'sent' | 'temporary' | 'active' = 'sent';
  public typeOptions: MultiSelectOption[] = [];
  public applicationOptions: MultiSelectOption[] = [];
  public types: string[] = [];
  public applications: string[] = [];
  public busy = false;

  public readonly modalRef = inject(ModalRef);
  private readonly manageCallService = inject(ManageCallService);
  private readonly communicationsService = inject(CallCommunicationsService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    const base = [
      { value: 'D:jconon_attachment:application', label: 'export.type.application' },
      { value: 'D:jconon_attachment:integration', label: 'export.type.integration' },
      { value: 'D:jconon_convocazione:attachment', label: 'communications.kind.convocazioni' },
      { value: 'D:jconon_comunicazione:attachment', label: 'communications.kind.comunicazioni' },
      { value: 'D:jconon_esclusione:attachment', label: 'communications.kind.esclusioni' }
    ];
    const call: any = this.call || {};
    const extra = [...(call.elenco_association || []), ...(call.elenco_sezioni_curriculum || []),
      ...(call.elenco_sezioni_curriculum_ulteriore || []), ...(call.elenco_prodotti || [])]
      .filter((v, i, a) => !!v && a.indexOf(v) === i).map(v => ({ value: v, label: v }));
    this.typeOptions = [...base, ...extra];
    this.communicationsService.candidates(this.call.objectId, 'active').subscribe(candidates =>
      this.applicationOptions = candidates.map(c => ({ value: c.id, label: `${c.cognome || ''} ${c.nome || ''}`.trim() || c.id })));
  }

  excel(): void {
    this.run(this.manageCallService.exportXls(this.call.objectId, this.xlsStatus));
  }

  zip(all: boolean, active: boolean): void {
    this.run(this.manageCallService.exportZip(this.call.objectId, {
      all, active, types: all ? this.types : [], applications: this.applications
    }));
  }

  private run(request: any): void {
    this.busy = true;
    request.subscribe(() => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'export.done');
    }, () => this.busy = false);
  }
}
