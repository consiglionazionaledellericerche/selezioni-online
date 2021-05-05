import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiMessageService } from '../api-message.service';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { MODULE_CONFIGURAZIONE } from '../../app-routing.module';
import { ApplicationService } from './application.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ApplicationUserService extends ApplicationService {

  public static ROUTE = 'application/user';
  
  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected translateService: TranslateService,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, router, translateService, configService);
  }

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getRoute(): string {
    return ApplicationUserService.ROUTE;
  }

  public getSelect2Mapping(): string {
    return ConfigService.PROXY + '?url=service/cnr/person/autocomplete-person';
  }

  public getPageOffset(): number {
    return 10;
  }

}
