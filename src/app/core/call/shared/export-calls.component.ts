import { Component, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ModalRef } from '../../../shared/modal/modal.service';
import { ConfigService } from '../../config.service';
import { ApiMessageService, MessageType } from '../../api-message.service';

/**
 * "Estrazione excel relative ai bandi filtrati" (come nel frontend legacy): cinque estrazioni sugli stessi
 * filtri dell'elenco bandi. L'elaborazione è asincrona: il link al file arriva per email.
 */
@Component({
  selector: 'app-export-calls',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon icon-success me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>
        {{ title | translate }}
      </h2>
      <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3 pb-4">
      <p class="small text-secondary">{{ info | translate }}</p>
      @if (lastType) {
        <div class="alert alert-success py-2">
          {{ 'export_calls.queued' | translate:{ value: ('export_calls.' + lastType + '.title' | translate), email: sentTo || '-' } }}
        </div>
      }
      <div class="row g-3">
        @for (option of options; track option.type) {
          <div class="col-md-6">
            <button type="button" class="export-option w-100 text-start" [disabled]="busy" (click)="run(option.type)"
                    [class.started]="started.includes(option.type)">
              <svg class="icon icon-primary me-2"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + option.icon"></use></svg>
              <span>
                <strong class="d-block">{{ 'export_calls.' + option.type + '.title' | translate }}</strong>
                <span class="small text-secondary">{{ 'export_calls.' + option.type + '.description' | translate }}</span>
                @if (started.includes(option.type)) {
                  <span class="small text-success d-block mt-1">{{ 'export_calls.started' | translate }}</span>
                }
              </span>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .export-option { display: flex; align-items: flex-start; padding: .9rem 1rem; background: #fff; border: 1px solid #d9dadb;
      border-left: 4px solid var(--app-primary); border-radius: 4px; height: 100%; }
    .export-option:hover:not(:disabled) { background: #f0f6fc; }
    .export-option:disabled { opacity: .6; }
    .export-option.started { border-left-color: #008758; }
  `],
})
export class ExportCallsComponent {
  /** Filtri correnti dell'elenco bandi. */
  public filters: { [key: string]: any } = {};
  /** Endpoint dell'estrazione (bandi filtrati o domande filtrate). */
  public endpoint = '/v1/call/export/filtered';
  public title = 'export_calls.title';
  public info = 'export_calls.info';
  public busy = false;
  public sentTo: string;
  public lastType: string;
  public started: string[] = [];
  public options = [
    { type: 'call', icon: 'it-file' },
    { type: 'commission', icon: 'it-user' },
    { type: 'application', icon: 'it-folder' },
    { type: 'score', icon: 'it-star-outline' },
    { type: 'istruttoria', icon: 'it-list' }
  ];

  public readonly modalRef = inject(ModalRef);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiMessageService = inject(ApiMessageService);

  run(type: string): void {
    // 'type' è il filtro della tipologia del bando: il tipo di estrazione va in 'exportType'
    let params = new HttpParams().set('exportType', type);
    Object.keys(this.filters || {})
      .filter(key => !['page', 'offset', 'exportType'].includes(key))
      .forEach(key => {
        const value = this.filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value instanceof Date ? value.toISOString().substring(0, 10) : String(value));
        }
      });
    this.busy = true;
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.post<{ email: string }>(apiBase + this.endpoint, null, { params }))
    ).subscribe(result => {
      this.busy = false;
      this.sentTo = result?.email || '';
      this.lastType = type;
      this.started = Array.from(new Set([...this.started, type]));
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'export_calls.queued_short');
    }, () => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.ERROR, 'admin.error.generic');
    });
  }
}
