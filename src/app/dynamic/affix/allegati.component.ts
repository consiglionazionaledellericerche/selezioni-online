import { ChangeDetectorRef, Component, SimpleChanges, ViewChildren } from '@angular/core';
import { ShowAffixComponent } from '../../shared/tags/show/show-affix.component';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Observable } from '@nativescript/core/data/observable';

@Component({
    selector: 'affix_tabAllegati',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && cache !== undefined" class="pb-2">
        <accordion [isAnimated]="true" [closeOthers]="true" class="shadow">
          <ng-container *ngFor="let attachment of data.call[callProperty]">
            <accordion-group #accordionGroup panelClass="border border-light no-after">
              <div class="d-flex" accordion-heading>
                <div class="p-1">
                  <h4 class="pull-left float-left text-primary" translate>{{attachment}}</h4>
                </div>
                <div class="p-1 h4">
                  <app-wizard-document (click)="accordionGroup.isOpen?accordionGroup.toggleOpen():undefined" [typeId]="attachment"></app-wizard-document>
                </div>
                <div class="ml-auto p-1">
                  <h4 class="float-right pull-right">
                    <svg class="icon icon-primary">
                      <use *ngIf="!accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-expand"></use>
                      <use *ngIf="accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-collapse"></use>
                    </svg>
                  </h4>                
                </div>
              </div>
              <children-list [show_date]="false" [parentId]="data.objectId" [typeId]="attachment"></children-list>
            </accordion-group>
          </ng-container>  
        </accordion>
      </form>
    `
  })
export class JcononAffixAllegatiComponent extends DynamicComponent {

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
