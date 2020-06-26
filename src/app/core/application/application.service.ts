import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService} from '../api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Application } from './application.model';

@Injectable()
export class ApplicationService extends CommonService<Application> {

  public static ROUTE = 'application';
  
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

  public getRoute(): string {
    return ApplicationService.ROUTE;
  }

}
