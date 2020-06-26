
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';
import {ApiMessageService, MessageType} from '../core/api-message.service';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '../core/config.service';

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
}