import {throwError as observableThrowError, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService, MessageType} from '../api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { SpringError } from '../../common/model/spring-error.model';
import { Helpers } from '../../common/helpers/helpers';
import { Document } from '../../common/model/document.model';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';

@Injectable()
export class DocumentService extends CommonService<Document>{

  public static ROUTE = 'document';
  
  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService, 
                     protected router: Router,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, router, configService);
  }

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getApiPath(): string {
    return '/v' + this.getApiVersion() + '/' + this.getRoute();
  }

  public getApiVersion() {
    return 1;
  }

  public getRoute(): string {
    return DocumentService.ROUTE;
  }

  public postDocument(parentId: string, entity: Document, fileToUpload: File): Observable<any> {
    const formData: FormData = new FormData();

    formData.append('file', fileToUpload, fileToUpload.name);
    formData.append('properties', new Blob([JSON.stringify(this.serializeInstance(entity))]));

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post(apiBase + this.getApiPath() + "/" + parentId, formData)
            .pipe(
              map((response) => {
                this.apiMessageService.sendMessage(MessageType.SUCCESS, 'Allegato inserito con successo.');
                return true;
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return ErrorObservable.create(springError);
              })
            );
        })
      );
  }

  
}
