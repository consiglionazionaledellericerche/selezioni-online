import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService} from '../../core/api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../../core/config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Attachment } from './attachment.model';
import { Observable, of } from 'rxjs';
import { Page } from '../../common/model/page.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ChildrenService extends CommonService<Attachment> {

  public static ROUTE = 'children';
  
  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected translateService: TranslateService,
                     protected router: Router,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, translateService, router, configService);
  }

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getRoute(): string {
    return ChildrenService.ROUTE;
  }

  public getPageOffset(): number {
    return 5;
  }


  /**
   * Senza contenitore (es. anteprima della domanda, che non esiste ancora) non c'è nulla da cercare:
   * elenco vuoto senza chiamare il backend, che richiede parentId.
   */
  public getPageable(page: number, filters: any): Observable<Page<Attachment>> {
    if (!filters || !filters['parentId']) {
      return of(new Page<Attachment>([], 0, 0, page, false));
    }
    return super.getPageable(page, filters);
  }
}
