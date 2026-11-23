import { ChangeDetectorRef, Component, Input, OnChanges, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ObjectType } from '../../../common/model/object-type.model';
import { Observable, EMPTY } from 'rxjs';
import { expand, reduce } from 'rxjs/operators';
import { ChildrenService } from '../../children/children.service';
import { Attachment } from '../../children/attachment.model';
import { Page } from '../../../common/model/page.model';

/**
 * Allegati del bando (bando, proroghe, rettifiche, convocazioni, graduatorie...) in fondo al dettaglio:
 * tipo, nome del file da scaricare, titolo/descrizione e dettagli (data, dimensione, formato, protocollo, versione).
 */
@Component({
  selector: 'app-call-attachments',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  template: `
    <section class="card shadow-sm rounded call-attachments mb-4" [attr.aria-label]="'layout.attachments.title' | translate">
      <div class="card-body p-4">
        <h2 class="h4 text-primary d-flex align-items-center gap-2 mb-1">
          {{ 'layout.attachments.title' | translate }}
          @if (attachments) { <span class="badge rounded-pill bg-primary">{{ attachments.length }}</span> }
        </h2>
        <p class="small text-secondary mb-3">{{ 'layout.attachments.subtitle' | translate }}</p>
        @if (attachments === undefined) {
          <div class="d-flex align-items-center gap-2 small text-secondary">
            <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}
          </div>
        } @else if (attachments.length === 0) {
          <p class="text-secondary mb-0">{{ 'layout.attachments.none' | translate }}</p>
        } @else {
          <ul class="list-unstyled mb-0 attachment-list">
            @for (item of attachments; track item.objectId) {
              <li class="attachment-item">
                <svg class="icon attachment-icon" [class]="'icon attachment-icon ' + iconClass(item)" aria-hidden="true">
                  <use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + icon(item)"></use>
                </svg>
                <div class="attachment-body">
                  <div class="attachment-type">{{ typeLabel(item) }}</div>
                  <button type="button" class="btn btn-link p-0 attachment-name text-start" (click)="download(item)">
                    {{ item.name }}
                    <svg class="icon icon-xs icon-primary ms-1" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
                  </button>
                  @if (item.title && item.title !== item.name) {
                    <div class="attachment-title">{{ item.title }}</div>
                  }
                  @if (item.description) {
                    <div class="attachment-description">{{ item.description }}</div>
                  }
                  <div class="attachment-meta">
                    @if (validDate(item.lastModificationDate)) {
                      <span><svg class="icon icon-xs" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-calendar"></use></svg>
                        {{ item.lastModificationDate | date:'dd/MM/yyyy HH:mm' }}</span>
                    }
                    <span>{{ format(item) }} · {{ item.getFileSize() }}</span>
                    @if (item.numeroProtocollo) {
                      <span>{{ 'layout.attachments.protocol' | translate:{ value: item.numeroProtocollo } }}
                        @if (item.dataProtocollo) { {{ 'layout.attachments.protocol_date' | translate }} {{ item.dataProtocollo | date:'dd/MM/yyyy' }} }
                      </span>
                    }
                    @if (signed(item)) {
                      <span class="text-success"><svg class="icon icon-xs icon-success" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-signed"></use></svg>
                        {{ 'layout.attachments.signed' | translate }}</span>
                    }
                    @if (version(item)) {
                      <span>{{ 'layout.attachments.version' | translate }} {{ version(item) }}</span>
                    }
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: [`
    .attachment-list { display: flex; flex-direction: column; }
    .attachment-item { display: flex; gap: 1rem; padding: .9rem 0; border-top: 1px solid #e3e8ee; }
    .attachment-item:first-child { border-top: 0; padding-top: .25rem; }
    .attachment-icon { flex-shrink: 0; width: 2.25rem; height: 2.25rem; margin-top: .15rem; }
    .attachment-body { min-width: 0; flex: 1; }
    .attachment-type { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; }
    .attachment-name { font-weight: 600; font-size: 1rem; word-break: break-word; }
    .attachment-title { font-size: .95rem; color: #17324d; margin-top: .15rem; }
    .attachment-description { font-size: .9rem; color: #455b71; margin-top: .1rem; }
    .attachment-meta { display: flex; flex-wrap: wrap; gap: .35rem 1.25rem; margin-top: .35rem; font-size: .85rem; color: #5d7083; }
    .attachment-meta .icon { width: .9rem; height: .9rem; fill: #5d7083; vertical-align: -2px; }
    .icon-pdf { fill: #d9364f; } .icon-doc { fill: var(--app-primary); } .icon-sheet { fill: #008758; } .icon-other { fill: #5d7083; }
  `],
})
export class CallAttachmentsComponent implements OnChanges {
  @Input() callId: string;
  public attachments: Attachment[];
  private readonly children = inject(ChildrenService);
  private readonly translate = inject(TranslateService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private loadedFor: string;

  ngOnChanges(): void {
    if (!this.callId || this.callId === this.loadedFor) {
      return;
    }
    this.loadedFor = this.callId;
    this.attachments = undefined;
    const filters = { parentId: this.callId, fetchObject: true };
    // tutte le pagine (gli allegati di un bando sono pochi; limite di sicurezza a 10 pagine)
    let pages = 0;
    this.children.getPageable(0, filters).pipe(
      expand((page: Page<Attachment>) => page.hasMoreItems && ++pages < 10
        ? this.children.getPageable(pages, filters) : EMPTY as Observable<Page<Attachment>>),
      reduce((all: Attachment[], page: Page<Attachment>) => all.concat(page.items || []), [])
    ).subscribe(items => {
      this.attachments = items.sort((a, b) =>
        (a.lastModificationDate ? new Date(a.lastModificationDate).getTime() : 0) - (b.lastModificationDate ? new Date(b.lastModificationDate).getTime() : 0));
      this.changeDetector.markForCheck();
    }, () => {
      this.attachments = [];
      this.changeDetector.markForCheck();
    });
  }

  private mime(item: Attachment): string {
    return String((item as any).contentStreamMimeType || '').toLowerCase();
  }

  icon(item: Attachment): string {
    const mime = this.mime(item);
    if (this.signed(item)) { return 'it-file-signed'; }
    if (mime.includes('pdf')) { return 'it-file-pdf'; }
    if (mime.includes('word') || mime.includes('opendocument.text')) { return 'it-file-docx'; }
    if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) { return 'it-file-xlsx'; }
    if (mime.includes('zip') || mime.includes('compressed')) { return 'it-file-compressed'; }
    if (mime.startsWith('image/')) { return 'it-file-image'; }
    return 'it-file';
  }

  iconClass(item: Attachment): string {
    const icon = this.icon(item);
    return icon === 'it-file-pdf' || icon === 'it-file-signed' ? 'icon-pdf'
      : icon === 'it-file-docx' ? 'icon-doc' : icon === 'it-file-xlsx' ? 'icon-sheet' : 'icon-other';
  }

  format(item: Attachment): string {
    const name = String(item.name || '');
    const ext = name.includes('.') ? name.split('.').pop() : '';
    return (ext || this.mime(item).split('/').pop() || '').toUpperCase();
  }

  signed(item: Attachment): boolean {
    return /\.p7m$/i.test(String(item.name || '')) || this.mime(item).includes('pkcs7');
  }

  version(item: Attachment): string {
    const label = (item as any).versionLabel;
    return label && label !== '1.0' ? label : '';
  }

  /** Tipo di allegato: traduzione, altrimenti testo leggibile dalla chiave. */
  typeLabel(item: Attachment): string {
    const key = item.objectTypeId || '';
    const translated = this.translate.instant(key);
    return translated && translated !== key ? translated : ObjectType.readable(key);
  }

  download(item: Attachment): void {
    this.children.getBlob('/rest/content?nodeRef=' + item.objectId, item.name);
  }

  /** Data presente e valida. */
  validDate(value: any): boolean {
    return !!value && !isNaN(new Date(value).getTime());
  }
}
