
import {throwError as observableThrowError, Observable, of as observableOf} from 'rxjs';

import {catchError, map, shareReplay, switchMap} from 'rxjs/operators';
import {ApiMessageService, MessageType} from './api-message.service';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from './config.service';

@Injectable({ providedIn: 'root' })
export class ObjectTypeService {

    public static BASE_URL = '/objecttype';

    constructor(
        private apiMessageService: ApiMessageService,
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {}

    public type(typeId: string): Observable<any> {
        return this.configService.getApiBase().pipe(switchMap((apiBase) => {
            return this.httpClient.get<any>(apiBase + '/v1' + ObjectTypeService.BASE_URL + '/' + typeId).pipe(
                map((type) => {
                    return type;
                }),
                catchError((error: HttpErrorResponse) => {
                    this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
                    return observableThrowError(error);
                })
            );
        }));
    }

    private monoCache = new Map<string, Observable<boolean>>();

    /**
     * Tipo di allegato a elemento unico (discendente di D:jconon_attachment:document_mono): nella domanda può
     * esserne caricato uno solo, altrimenti il backend blocca l'invio. Errori: considerato non unico.
     */
    public isMono(typeId: string): Observable<boolean> {
        if (!this.monoCache.has(typeId)) {
            this.monoCache.set(typeId, this.configService.getApiBase().pipe(
                switchMap(apiBase => this.httpClient.get<{ mono: boolean }>(apiBase + '/v1' + ObjectTypeService.BASE_URL + '/' +
                    encodeURIComponent(typeId) + '/mono')),
                map(result => !!(result && result.mono)),
                catchError(() => observableOf(false)),
                shareReplay(1)
            ));
        }
        return this.monoCache.get(typeId);
    }

    public listChoice(typeId: string, propertyId: string): Observable<string[]> {
        return this.configService.getApiBase().pipe(switchMap((apiBase) => {
            return this.httpClient.get<string[]>(apiBase + '/v1' + ObjectTypeService.BASE_URL + 
                                            '/' + typeId + '/' + propertyId + '/constraint').pipe(
                map((choice) => {
                    return choice;
                }),
                catchError((error: HttpErrorResponse) => {
                    this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
                    return observableThrowError(error);
                })
            );
        }));
    }
}