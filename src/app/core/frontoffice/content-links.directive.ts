import { Directive, HostListener, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { saveAs } from 'file-saver';
import { ConfigService } from '../config.service';
import { ApiMessageService, MessageType } from '../api-message.service';

/**
 * Link ai documenti del repository dentro testi HTML scritti per il legacy (es. avvisi e FAQ:
 * "rest/content?nodeRef=..."): relativi al backend, nel frontend non funzionerebbero. Il clic scarica il documento
 * dal backend con la sessione dell'utente, con il nome originale del file.
 */
@Directive({
  selector: '[appContentLinks]',
  standalone: true
})
export class ContentLinksDirective {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiMessageService = inject(ApiMessageService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement)?.closest?.('a') as HTMLAnchorElement;
    const href = anchor?.getAttribute('href') || '';
    const match = /(?:^|\/)rest\/content\?(.*)$/.exec(href.trim());
    if (!match) {
      return;
    }
    event.preventDefault();
    const fallbackName = (anchor.textContent || 'documento').trim();
    const nodeRef = new URLSearchParams(match[1]).get('nodeRef');
    // nome originale del file dai metadati del documento (il testo del link è spesso "qui")
    const metadata = nodeRef ? this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.get<any>(apiBase + '/v1/document/metadata', { params: { id: nodeRef } })),
      catchError(() => of(null))
    ) : of(null);
    const content = this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get(gateway + '/rest/content?' + match[1], { responseType: 'blob', observe: 'response' }))
    );
    forkJoin([content, metadata]).subscribe(([response, document]: [HttpResponse<Blob>, any]) => {
      const name = document && (document['cmis:contentStreamFileName'] || document['cmis:name'] || document.name);
      saveAs(response.body, name || ContentLinksDirective.filename(response.headers.get('Content-Disposition')) || fallbackName);
    }, () => this.apiMessageService.sendMessage(MessageType.ERROR, 'message.document.download.error'));
  }

  /** Nome del file da Content-Disposition (filename* in UTF-8 o filename). */
  private static filename(disposition: string): string {
    if (!disposition) {
      return null;
    }
    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (utf8) {
      return decodeURIComponent(utf8[1]);
    }
    const plain = /filename="?([^";]+)"?/i.exec(disposition);
    return plain ? plain[1] : null;
  }
}
