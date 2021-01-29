
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';
import {ApiMessageService, MessageType} from './api-message.service';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from './config.service';

@Injectable()
export class ObjectTypeService {

    public static BASE_URL = '/objecttype';

    constructor(
        private apiMessageService: ApiMessageService,
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {}

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