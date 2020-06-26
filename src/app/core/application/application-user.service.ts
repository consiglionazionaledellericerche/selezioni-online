import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService} from '../api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Application } from './application.model';
import {JsonConvert, ValueCheckingMode} from 'json2typescript';

@Injectable()
export class ApplicationUserService extends CommonService<Application> {

  public static ROUTE = 'application/user';
  
  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, router, configService);
  }


  public buildInstance(json: any): Application {
    let jsonConvert: JsonConvert = new JsonConvert();
        jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
        
    return jsonConvert.deserializeObject(json, Application);
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

}
