import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CommonService } from '../../common/controller/common.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { MODULE_CONFIGURAZIONE } from '../../app-routing.module';
import { TranslateService } from '@ngx-translate/core';
import { CmisObject } from '../../common/model/cmisobject.model';
import { SpringError } from '../../common/model/spring-error.model';

@Injectable()
export class SearchService extends CommonService<CmisObject>{

  public static ROUTE = 'search';
  
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

  public getApiPath(): string {
    return '/rest/' + this.getRoute();
  }

  public getApiVersion() {
    return 1;
  }

  public getRoute(): string {
    return SearchService.ROUTE;
  }

  public execute(query: string): Observable<CmisObject[]> {
    if (!query) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Query mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('q', query);
    return this.configService.getGateway()
    .pipe(
      switchMap((gateway) => {
        return this.httpClient.get<CmisObject[]>(gateway + this.getApiPath(), {params: params})
          .pipe(
            map((result: any) => {
              try {
                if (!result.items) {
                  return [];
                }
                const items: CmisObject[] = result.items.map((item) => {
                  const instance: CmisObject = this._buildInstance(item);
                  return instance;
                });
                return items;
              } catch (ex) {
                console.log(ex);
                this.apiMessageService.sendMessage(MessageType.ERROR, ex.message);
                observableThrowError(ex);
              }
            }),
            catchError( (httpErrorResponse: HttpErrorResponse) => {
              const springError = new SpringError(httpErrorResponse, this.translateService);
              this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
              return observableThrowError(springError);
            })
          );
      })
    );
  }  
}
