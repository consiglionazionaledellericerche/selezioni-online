import { ChangeDetectorRef, Component, SimpleChanges, ViewChildren } from '@angular/core';
import { ShowAffixComponent } from '../../shared/tags/show/show-affix.component';
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
                  <show-affix #dichiarazioniComponent [form]="form" [cmisObject]="data" [type]="aspect"></show-affix>
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
    @ViewChildren('dichiarazioniComponent') dichiarazioniComponents: ShowAffixComponent[];

    public ngOnChanges(changes: SimpleChanges) {
      this.dichiarazioniComponents.forEach(dichiarazioniComponent => dichiarazioniComponent.ngOnChanges(changes));
    }
}