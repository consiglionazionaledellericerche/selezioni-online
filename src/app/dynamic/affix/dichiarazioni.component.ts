import { ChangeDetectorRef, Component, SimpleChanges, ViewChildren } from '@angular/core';
import { ShowAffixComponent } from '../../shared/tags/show/show-affix.component';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'affix_tabDichiarazioni',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && cache !== undefined" class="pb-2">
        <div class="it-list-wrapper">
          <ul class="it-list pl-2">
            <ng-container *ngFor="let aspect of data.call[callProperty]">
              <li class="shadow-sm p-0 mb-1 bg-white" *ngIf="isShow(aspect)">
                  <show-affix #dichiarazioniComponent [form]="form" [cmisObject]="data" [type]="aspect"></show-affix>
              </li>
            </ng-container>
          </ul>
        </div>  
      </form>
    `,
    styles: [
      'ul.it-list {list-style-type: upper-alpha;}',
      'ul.it-list li::marker {font-weight: bold;}'
    ]
  })
export class JcononAffixDichiarazioniComponent extends DynamicComponent {

  constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    cache: any;
    public callProperty: string;

    @ViewChildren('dichiarazioniComponent') dichiarazioniComponents: ShowAffixComponent[];
    ngOnInit(): void {
      this.cacheService.cache().subscribe((cache) => {
        this.cache = cache;
      });
      super.ngOnInit();
    }
  
    public ngOnChanges(changes: SimpleChanges) {
      this.dichiarazioniComponents.forEach(dichiarazioniComponent => dichiarazioniComponent.ngOnChanges(changes));
    }

    public isShow(aspect: string): boolean {
      if (this.cache.jsonlistApplicationNoAspectsItalian === undefined ||
          this.cache.jsonlistApplicationNoAspectsForeign === undefined) {
        return true;
      }
      if (this.data.fl_cittadino_italiano) {
        return this.cache.jsonlistApplicationNoAspectsItalian.some(x => x.key !== aspect);
      } else {
        return this.cache.jsonlistApplicationNoAspectsForeign.some(x => x.key !== aspect);
      }
    }
}
