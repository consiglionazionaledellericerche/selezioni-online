import {ChangeDetectorRef, Component, OnInit, Input} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {NavigationService} from '../../core/navigation.service';
import { Call } from './call.model';
import { CallService } from './call.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'call-list',
  template:
  `
    <!-- List -->
    <app-grid-layout [loading]="loading" [items]="items" [page]="getPage()" [showTotalOnTop]="showTotalOnTop"
                     [count]="count" (onChangePage)="onChangePage($event)" [page_offset]="pageOffset">
      <div *ngFor="let item of items" class="col-sm-12 px-md-2 pb-2" [ngClass]="classForDisplayCard()">
        <app-list-item-call [item]="item" [filterForm]="filterForm" (onDelete)="onDelete(item.getId())">
          <div class="col-sm-12">
            <app-show-text [label]="'call.profilo'" [value]="item.profilo" [strong]="false"></app-show-text>
          </div>  
          <div class="col-sm-12">
            <app-show-text [label]="'call.elenco_macroaree'" [value]="item.elenco_macroaree" ></app-show-text>
          </div>  
          <div class="col-sm-12">
            <app-show-text [label]="'call.elenco_settori_tecnologici'" [value]="item.elenco_settori_tecnologici" ></app-show-text>
          </div>  
          <div class="col-sm-12">
            <app-show-text [label]="'call.sede'" [value]="item.sede" ></app-show-text>
          </div>  
          <div class="col-sm-12">
              <ng-template #popTemplate>
                <h5 class="font-weight-semibold">
                  <svg class="icon icon-secondary"><use xlink:href="/assets/vendor/sprite.svg#it-info-circle"></use></svg> Info
                </h5>
                <hr>
                <div [innerHtml]="translateService.currentLang == 'it'? item.descrizione: item.descrizione_en"></div>
              </ng-template>
              <app-show-text 
                [label]="'call.codice'" 
                [value]="item.codice">
              </app-show-text>
              <a class="btn btn-sm btn-link p-0 mb-3 ml-n1" [popover]="popTemplate" [outsideClick]="true">
                <svg class="icon icon-xs icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-info-circle"></use></svg>
              </a>
          </div>  
          <div class="col-sm-12">    
              <app-show-text [label]="'call.numero_gu'" [value]="item.numero_gu" [strong]="false"></app-show-text>
              <app-show-text [label]="'call.data_gu'" [value]="item.data_gu | date:'dd/MM/yyyy'" [strong]="false"></app-show-text>
          </div>
          <div class="col-sm-12">
              <app-show-text 
                [label]="'call.data_fine_invio_domande'" 
                [value]="item.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm'">
              </app-show-text>
          </div>
          <div class="col-sm-12">
              <app-show-text [label]="'call.numero_posti'" [value]="item.numero_posti" [strong]="false"></app-show-text>
              <app-show-text [label]="'call.numero_max_domande'" [value]="item.numero_max_domande" [strong]="false"></app-show-text>
              <app-show-text-modal 
              [label]="'call.elenco_titoli_studio'" 
              [value]="translateService.currentLang == 'it'? item.requisiti_link: item.requisiti_link_en" 
              [modal_title]="'Info'" 
              [modal_text]="translateService.currentLang == 'it'? item.requisiti: item.requisiti_en"
              [strong]="false">
              </app-show-text-modal>
          </div>
        </app-list-item-call>
      </div>
    </app-grid-layout>
  `
})
export class CallListComponent extends CommonListComponent<Call> implements OnInit {

  public items: Call[] = [];
  @Input() showTotalOnTop: boolean = true;
  pageOffset = CallService.PAGE_OFFSET;

  public constructor(public service: CallService,
                     protected route: ActivatedRoute,
                     protected router: Router,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, router, changeDetector, navigationService);
  }

  public setItems(items: Call[]) {
    this.items = items;
  }

  public getItems(): Call[] {
    return this.items;
  }

  public buildFilterForm(): FormGroup {
    return this.filterForm;
  }

  public classForDisplayCard() {    
    return {
      'col-md-12': this.count <= 1,
      'col-lg-4': this.count > 1
    };
  }

}
