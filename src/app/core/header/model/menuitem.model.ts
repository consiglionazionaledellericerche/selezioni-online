import {CommonService} from '../../../common/controller/common.service';
import {Injector} from '@angular/core';
import {Observable} from 'rxjs';

export class MenuItem {

  public active = false;                    // l'item sarà visibile
  public dependent = false;                // l'item dipende da altri item

  public pathToCheck;

  constructor(public name: string,
              public icon: string,
              public path: string,
              public label: string,
              public depending?: MenuItem[]) {}


}
