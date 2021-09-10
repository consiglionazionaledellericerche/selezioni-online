
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';
import {ApiMessageService, MessageType} from '../core/api-message.service';

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '../core/config.service';
import { Comune } from '../common/model/comune.model';
import { Sede } from '../common/model/sede.model';

@Injectable()
export class CacheService {

    constructor(
        private apiMessageService: ApiMessageService,
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {}

    public cache(): Observable<any> {
        return this.configService.getApiBase().pipe(switchMap((apiBase) => {
            return this.httpClient.get<any>(apiBase + ConfigService.URL_CACHE).pipe(
                map((cache) => {
                    return cache;
                }),
                catchError((error: HttpErrorResponse) => {
                    this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
                    return observableThrowError(error);
                })
            );
        }));
    }

    public paesi(): Observable<string[]> {
        return this.configService.getGateway().pipe(switchMap((gateway) => {
            return this.httpClient.get<string[]>(gateway + ConfigService.URL_PAESI).pipe(
                map((paesi) => {
                    return paesi;
                }),
                catchError((error: HttpErrorResponse) => {
                    this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
                    return observableThrowError(error);
                })
            );
        }));
    }

    public sedi(attive: string): Observable<Sede[]> {
        const params = new HttpParams()
        .set('attive', attive);
        return this.configService.getGateway().pipe(switchMap((gateway) => {
            return this.httpClient.get<Sede[]>(gateway + ConfigService.URL_SEDI, {params: params}).pipe(
                map((sedi) => {
                    return sedi.map((sede) => {
                        return new Sede(sede.sedeId, sede.label, sede.citta, sede.descrizione);
                    });
                }),
                catchError((error: HttpErrorResponse) => {
                    this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
                    return observableThrowError(error);
                })
            );
        }));
    }
}