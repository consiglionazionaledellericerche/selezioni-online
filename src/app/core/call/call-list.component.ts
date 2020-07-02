import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {NavigationService} from '../../core/navigation.service';
import { Call } from './call.model';
import { CallService } from './call.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'call-list',
  template:
  `
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()">
        <app-list-item-call [item]="item" (onDelete)="onDelete(item.getId())">
          <div class="col-sm-12 font-weight-bold">{{ item.objectTypeId | translate }}</div>
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
              <app-show-text-modal 
                [label]="'call.codice'" 
                [value]="item.codice" 
                [modal_title]="'Info'" 
                [modal_text]="translateService.currentLang == 'it'? item.descrizione: item.descrizione_en">
              </app-show-text-modal>
              <app-show-text [label]="'call.numero_gu'" [value]="item.numero_gu" [strong]="false"></app-show-text>
              <app-show-text [label]="'call.data_gu'" [value]="item.data_gu | date:'dd/MM/yyyy'" [strong]="false"></app-show-text>
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
      </li>
    </app-list-layout>
  `
})
export class CallListComponent extends CommonListComponent<Call> implements OnInit {

  public items: Call[] = [];

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

}
