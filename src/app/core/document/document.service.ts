import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CommonService } from '../../common/controller/common.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { MODULE_CONFIGURAZIONE } from '../../app-routing.module';
import { SpringError } from '../../common/model/spring-error.model';
import { Document } from '../../common/model/document.model';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DocumentService extends CommonService<Document>{

  public static ROUTE = 'document';
  
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
    return '/v' + this.getApiVersion() + '/' + this.getRoute();
  }

  public getApiVersion() {
    return 1;
  }

  public getRoute(): string {
    return DocumentService.ROUTE;
  }

  public createDocument(parentId: string, entity: Document, fileToUpload: File): Observable<Document> {
    const formData: FormData = new FormData();
    if (fileToUpload) {
      formData.append('file', fileToUpload, fileToUpload.name);
    }
    formData.append('properties', new Blob([JSON.stringify(this.serializeInstance(entity))]));

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post(apiBase + this.getApiPath() + "/create/" + parentId, formData)
            .pipe(
              map((response) => {
                return this.buildInstance(response);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return ErrorObservable.create(springError);
              })
            );
        })
      );
  }

  public updateDocument(entity: Document, fileToUpload: File): Observable<Document> {
    const formData: FormData = new FormData();
    if (fileToUpload) {
      formData.append('file', fileToUpload, fileToUpload.name);
    }
    formData.append('properties', new Blob([JSON.stringify(this.serializeInstance(entity))]));

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post(apiBase + this.getApiPath() + "/update", formData)
            .pipe(
              map((response) => {
                return this.buildInstance(response);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return ErrorObservable.create(springError);
              })
            );
        })
      );
  }

  public deleteDocument(objectId: string): Observable<any> {
    const params = new HttpParams().set('objectId', objectId);
    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.delete(apiBase + this.getApiPath() + "/delete", {params: params})
            .pipe(
              map((response) => {
                return response;
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return ErrorObservable.create(springError);
              })
            );
        })
      );
  }
  
}
