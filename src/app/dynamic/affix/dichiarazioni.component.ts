import { ChangeDetectorRef, Component } from '@angular/core';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'affix_tabDichiarazioni',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" class="pb-2">
        <div class="it-list-wrapper">
          <ul class="it-list">
            <ng-container *ngFor="let aspect of data.call.elenco_aspects">
              <li class="pb-2">
                  <show-affix [form]="form" [cmisObject]="data" [type]="aspect"></show-affix>
              </li>
            </ng-container>
          </ul>
        </div>  
      </form>
    `
  })
export class JcononAffixDichiarazioniComponent extends DynamicComponent {

  constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
}