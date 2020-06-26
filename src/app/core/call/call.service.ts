import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService} from '../../core/api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../../core/config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Call } from './call.model';

@Injectable()
export class CallService extends CommonService<Call> {

  public static ROUTE = 'call';

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
    return CallService.ROUTE;
  }

  public getSelect2Mapping(): string {
    return ConfigService.API_BASE + super.getSelect2Mapping();
  }
}
