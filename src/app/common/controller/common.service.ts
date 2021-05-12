
import {throwError as observableThrowError, of as observableOf, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {ApiMessageService, MessageType} from '../../core/api-message.service';
import {SpringError} from '../model/spring-error.model';
import {Page} from '../model/page.model';
import {Helpers} from '../helpers/helpers';
import {Router} from '@angular/router';
import {Enum} from '../model/enum.model';
import {ConfigService} from '../../core/config.service';
import {ActivatedRoute} from '@angular/router';
import {JsonConvert, ValueCheckingMode} from 'json2typescript';
import { Base } from '../model/base.model';
import { CmisObject } from '../model/cmisobject.model';
import { ObjectType } from '../model/object-type.model';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';
import { TranslateService } from '@ngx-translate/core';

export abstract class CommonService<T extends Base> {

  static PAGE_OFFSET = 10;

  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected translateService: TranslateService,
                     protected router: Router,
                     protected configService: ConfigService) {}

  protected _buildInstance(json: any): T {
    if (json) {
      const instance: T = this.buildInstance(json);
      if (!instance.hasId()) {
        throw new TypeError('Errore interno all\'applicazione codice 1');
      }
      instance.setAllowableActions(json.allowableActions);

      return instance;
    }
    return null;
  }

  public buildInstance(json: any): T {
    let jsonConvert: JsonConvert = new JsonConvert();
        jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
        jsonConvert.ignoreRequiredCheck = true;
    return jsonConvert.deserializeObject(json, this.createInstance(json['cmis:objectTypeId'], json['cmis:baseTypeId']));
  }

  public serializeInstance(obj: T): any {
    let jsonConvert: JsonConvert = new JsonConvert();
        jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
        jsonConvert.ignoreRequiredCheck = true;
    try {
      return jsonConvert.serializeObject(obj, this.createInstance(obj.getType(), obj.getBaseType()));
    } catch (ex) {
      console.log(ex);
      this.apiMessageService.sendMessage(MessageType.ERROR, ex.message);
    }   
  }

  protected createInstance(cmisType: string, cmisBaseType: string): { new (): T; } {
    return ObjectType.createInstance(cmisType, cmisBaseType);
  }

  public getRequestMapping(): string {
    return this.getApiService() + this.getApiPath();
  }

  public getApiPath(): string {
    return '/v' + this.getApiVersion() + '/' + this.getRoute();
  }

  public getSelect2Mapping(): string {
    return this.getRequestMapping() + '/select2';
  }

  public abstract getModule(): string;

  public abstract getRoute(): string;

  public abstract getApiService(): string;

  public getApiVersion() {
    return 1;
  }

  public getPageOffset(): number {
    return CommonService.PAGE_OFFSET;
  }

  public saveMessage(): string {
    return 'Elemento salvato correttamente.';
  }

  public deleteMessage(): string {
    return 'Elemento cancellato correttamente.';
  }

  /**
   * Get All.
   * @returns {Observable<T[]>}
   */
  public getAll(filter?: {}, path?: string): Observable<T[]> {
    path = path ? path : '';

    let params = new HttpParams();

    params = this.appendToImmutableHttpParams(filter, params);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.get<Page<T>>( apiBase + this.getRequestMapping() + path, {params: params})
            .pipe(
              map((result) => {
                try {
                  if (!result.items) {
                    return [];
                  }
                  const items: T[] = result.items.map((item) => {
                    const instance: T = this._buildInstance(item);
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
                this.apiMessageService.sendMessage(MessageType.ERROR,  springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
      );
  }

  /**
   * Get Pageable.
   * @param {number} page
   * @returns {Observable<Page<T extends Base>>}
   */
  public getPageable(page: number, filter: {}): Observable<Page<T>> {

    let params = new HttpParams().set('page', page + '').set('offset', this.getPageOffset() + '');

    params = this.appendToImmutableHttpParams(filter, params);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.get<Page<T>>(apiBase + this.getRequestMapping(), {params: params})
            .pipe(
              map((result) => {
                try {
                  const items: T[] = result.items.map((item) => {
                    const instance: T = this._buildInstance(item);
                    return instance;
                  });
                  return new Page(items, result.count, result.offset, result.page);
                } catch (ex) {
                  this.apiMessageService.sendMessage(MessageType.ERROR, ex.message);
                  observableThrowError(ex);
                }
              }),
              catchError( (error: HttpErrorResponse) => {
                const springError = new SpringError(error, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR,  springError.getRestErrorMessage());
                return observableThrowError(error.error);
              })
            );
        })
      );
  }

  /**
   * For Select end point.
   * @returns {Observable<T[]>}
   */
  public forSelect(filter?: {}): Observable<T[]> {
    return this.getAll(filter, '/select');
  }

  /**
   * Get entity by id.
   * @param {number} id
   * @returns {Observable<T>}
   */
  public getById(id: string): Observable<T> {

    if (!id) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.get<T>(apiBase + this.getRequestMapping() + '/' + id)
            .pipe(
              map((item) => {
                try {
                  const instance: T = this._buildInstance(item);
                  return instance;
                } catch (ex) {
                  console.log(ex);
                  this.apiMessageService.sendMessage(MessageType.ERROR, ex);
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

  /**
   * Save entity.
   * @param entity
   * @returns {Observable<T>}
   */
  public create(entity: T): Observable<T> {

    // return observableThrowError(null);
    return this.configService.getGateway()
      .pipe(
        switchMap((gateway) => {
          return this.httpClient.post<T>(this.getCreateURL(gateway), this.serializeInstance(entity))
            .pipe(
              map(result => {
                this.apiMessageService.sendMessage(MessageType.SUCCESS, this.saveMessage());
                return this._buildInstance(result);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
    );
  }

  protected getCreateURL(gateway: string): string {
    return gateway + ConfigService.API_BASE + this.getRequestMapping() + '/create';
  }

  /**
   * Save entity.
   * @param entity
   * @returns {Observable<T>}
   */
  public save(entity: T): Observable<T> {

    if (!entity.getId()) {
      return this.create(entity);
    }    

    return this.configService.getGateway()
      .pipe(
        switchMap((gateway) => {
          return this.httpClient.put<T>(this.getSaveURL(gateway), this.serializeInstance(entity))
            .pipe(
              map((result) => {
               this.apiMessageService.sendMessage(MessageType.SUCCESS, this.saveMessage());
               return this._buildInstance(result);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
               const springError = new SpringError(httpErrorResponse, this.translateService);
               this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
               return observableThrowError(springError);
              })
            );
        })
      );
  }

  protected getSaveURL(gateway: string): string {
    return gateway + ConfigService.API_BASE + this.getRequestMapping() + '/update';
  }

  /**
   * Delete entity.
   * @param {number} id
   * @returns {any}
   */
  public delete(id: number) {

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.delete<any>(apiBase + this.getRequestMapping() + '/delete/' + id)
            .pipe(
              map((deletedEntity) => {
                this.apiMessageService.sendMessage(MessageType.SUCCESS, this.deleteMessage());
                // return this._buildInstance(deletedEntity);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );

        })
      );
  }

  /**
   * Get programmabile. Fornire il path relativo e i queryParams.
   * @param {string} relativePath
   * @param {HttpParams} params
   * @returns {Observable<any>}
   */
  public getEntity(relativePath: string, params: HttpParams): Observable<T> {

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.get<T>(apiBase + this.getRequestMapping() + relativePath,{params: params})
            .pipe(
              map( (result) => {
                const instance: T = this._buildInstance(result);
                return instance;
              }),
              catchError((responseError: HttpErrorResponse) => {
                if (responseError.status === 204) {  // No Content
                  return observableOf(null);
                }
                const springError = new SpringError(responseError, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(responseError);
              })
            );
        })
      );
  }

  /**
   * Get programmabile. Fornire il path relativo e i queryParams.
   * @param {string} relativePath
   * @param {HttpParams} params
   * @returns {Observable<any>}
   */
  public getArray(relativePath: string, params: HttpParams, customRequestMapping?: string): Observable<T[]> {

    const requestMapping = customRequestMapping ? customRequestMapping :  this.getRequestMapping();
    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.get<T[]>(apiBase + requestMapping + relativePath,{params: params})
            .pipe(
              map( (result: T[]) => {
                const items: T[] = result.map((item) => {
                  const instance: T = this._buildInstance(item);
                  return instance;
                });
                return items;
              }),
              catchError((responseError: HttpErrorResponse) => {
                if (responseError.status === 204) {  // No Content
                  return observableOf(null);
                }
                const springError = new SpringError(responseError, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(responseError);
              })
            );
        })
      );
  }

  /**
   * Get programmabile. Fornire il path relativo e i queryParams.
   * @param {string} relativePath
   * @param {HttpParams} params
   * @returns {Observable<any>}
   */
  public getBoolean(relativePath: string, params: HttpParams): Observable<boolean> {

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.get<boolean>(apiBase + this.getRequestMapping() + relativePath,{params: params})
            .pipe(
              map( (result) => {
                  return result;
              }),
              catchError((responseError: HttpErrorResponse) => {
                return observableThrowError(responseError);
              })
            );
        })
      );
  }

    /**
   * Get programmabile. Fornire il path relativo e i queryParams.
   * @param {string} relativePath
   * @param {HttpParams} params
   * @returns {Observable<any>}
   */
  public getAny(relativePath: string, params: HttpParams): Observable<any> {

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.get<any>(apiBase + this.getRequestMapping() + relativePath,{params: params})
            .pipe(
              map( (result) => {
                  return result;
              }),
              catchError((responseError: HttpErrorResponse) => {
                return observableThrowError(responseError);
              })
            );
        })
      );
  }

  public postEntity(relativePath: string, obj): Observable<T> {

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          // debugger;

          return this.httpClient.post<T>(apiBase + this.getRequestMapping() + '/' + relativePath, Helpers.objToJsonObj(obj))
            .pipe(
              map((result) => {
                this.apiMessageService.sendMessage(MessageType.SUCCESS, this.saveMessage());
                return this._buildInstance(result);
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
      );
  }

  /**
   * Aggiunge i campi presenti in obj in httpParams.
   *
   * N.B. Crea una nuova istanza di HttpParams. Il chiamante deve riassegnare l'istanza.
   * https://stackoverflow.com/questions/45210406/angular-4-3-httpclient-set-params
   *
   * Per le entity Base assegna come valore getId().
   * Per le entity Enum assegna come valore getEnumValue().
   *
   * @param {{}} obj
   * @param {HttpParams} httpParams
   * @returns {HttpParams}
   */
  public appendToImmutableHttpParams(obj: {}, httpParams: HttpParams) {
    if (obj === undefined) {
      return httpParams;
    }
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value === null || value === undefined) {
        return;
      }
      if (value instanceof CmisObject) {
        httpParams = httpParams.append(key, value.getId() + '');
        return;
      }
      if (value instanceof Enum) {
        httpParams = httpParams.append(key, value.getEnumValue());
        return;
      }
      if (value instanceof Date) {
        httpParams = httpParams.append(key, Helpers.formatDate(value));
        return;
      }
      httpParams = httpParams.append(key, value);
    });
    return httpParams;
  }

  /**
   * Check Get All.
   * @returns {Observable<boolean>}
   */
  public pCheck(): Observable<boolean> {
    return this.performPCheck(null);
  }

  /**
   * Check create.
   * @param {T} entity
   * @returns {Observable<boolean>}
   */
  public pCheckCreate(): Observable<boolean> {
    return this.performPCheck('/create');
  }

  /**
   * Check delete.
   * @param {T} entity
   * @returns {Observable<boolean>}
   */
  public pCheckDelete(): Observable<boolean> {
    return this.performPCheck('/delete');
  }

  private performPCheck(path: string): Observable<boolean> {

    path = path ? path : '';

    const params = new HttpParams().set('path', this.getApiPath() + path);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {

          return this.httpClient.get<boolean>(apiBase + '/v1/pcheck', {params: params})
            .pipe(
              map((result) => {
                return result;
              }),
              catchError((error) => {
                return observableOf(null);
              })
            );
        })
      );
  }

  public getBlob(endpoint: string, filename: string) {

    return this.configService.getGateway().pipe(switchMap((gateway) => {

      return this.httpClient.get(gateway + endpoint, {responseType: 'blob'}).pipe(map( (res) => {

        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove(); // remove the element

        return res;
      }),catchError((responseError: HttpErrorResponse) => {

        this.apiMessageService.onApiMessage.error('Immpossibile scaricare il file allegato');

        return ErrorObservable.create(responseError);
      }),);
    })).subscribe( () => {});
  }

  public turnIdsIntoEntities(ids: string[], list: T[]): T[] {
    return list.filter(entity => ids.includes(entity.getId()));
  }

  public navigate(path: string[], route: ActivatedRoute) {
    this.router.navigate(path, {relativeTo: route, replaceUrl: true});
  }

}
