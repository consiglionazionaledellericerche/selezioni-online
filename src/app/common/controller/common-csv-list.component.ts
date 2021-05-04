
import {Base} from '../model/base.model';
import {throwError as observableThrowError, of as observableOf, Observable} from 'rxjs';
import {SpringError} from '../model/spring-error.model';
import {ApiMessageService, MessageType} from '../../core/api-message.service';

import {catchError, map, switchMap} from 'rxjs/operators';
import {CommonListComponent} from './common-list.component';
import {ChangeDetectorRef, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {CommonService} from './common.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationService} from '../../core/navigation.service';
import {ConfigService} from '../../core/config.service';
import { saveAs } from 'file-saver';
import { TranslateService } from '@ngx-translate/core';

export abstract class CommonListCsvComponent<T extends Base> extends CommonListComponent<T> implements OnInit, OnDestroy{
  
  
  // -------------------------------
  // Costruttore
  // -------------------------------

  public constructor(protected service: CommonService<T>,
    protected route: ActivatedRoute,
    protected router: Router,
    protected changeDetector: ChangeDetectorRef,
    protected navigationService: NavigationService,
    protected configService: ConfigService,
    protected httpClient: HttpClient,
    public translateService: TranslateService,
    protected apiMessageService: ApiMessageService) {
      super(service, route, router, changeDetector, navigationService);
    }

  public getCsv() {
    let params = this.service.appendToImmutableHttpParams(this.filterFormValue(), new HttpParams());

    this.configService.getApiBase()
    .pipe(
      switchMap((apiBase) => {
        return this.httpClient.get(apiBase + this.service.getRequestMapping() + '/csv', {params: params, responseType: 'blob'})
          .pipe(
            map((result) => {
              return result;
            }),
            catchError( (error: HttpErrorResponse) => {
              const springError = new SpringError(error, this.translateService);
              this.apiMessageService.sendMessage(MessageType.ERROR,  springError.getRestErrorMessage());
              return observableThrowError(error.error);
            })
          );
      })
    ).subscribe(
      (result: any) => {
        saveAs(result, this.service.getRoute() + '.csv');   
      }
    );
  }

  public ngOnInit() {
    super.ngOnInit();
  }
}
