import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TableRow} from '../../../common/model/table-row.model';
import {AllowableAction} from '../../../common/model/allowableaction.enum';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: '[app-table-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
     `
     <td class="pl-2" *ngFor="let key of keys">

       <!-- print value -->

       <span *ngIf="printTemplate(row, key)" [innerHtml]="sanitizedTemplateValue(row, key)"></span>
       <span *ngIf="printTranslate(row, key)">{{ row.getRowValue(key).value | translate }}</span>
       <span *ngIf="printRaw(row, key)">{{ row.getRowValue(key).value }}</span>
       <span *ngIf="printBoolean(row, key)"><i *ngIf="booleanValue(row, key)" class="fa fa-check"></i></span>

       <!-- side buttons -->

       <div *ngIf="isLastKey(key)" class="magic-menu" [ngStyle]="buttonStyle()">
         <div class="btn-group" >

           <button *ngIf="hasShow()" class="btn btn-secondary btn-sm"
                   [disabled]="!hasShow()"
                   (click)="navigateShow()">
             <i class="fa fa-eye"></i></button>

           <button *ngIf="hasUpdate()" class="btn btn-primary btn-sm"
                   [disabled]="!hasUpdate()"
                   [routerLink]="[editRoute + getItem().getId()]">
             <i class="fa fa-edit"></i></button>

           <button *ngIf="hasUpdateValidity()"
                   class="btn btn-info btn-sm"
                   [disabled]="!hasUpdateValidity()"
                   [routerLink]="[editValiditaRoute + getItem().getId()]">
             <i class="fa fa-calendar"></i>
           </button>

         </div>
       </div>
     </td>
    `,
  styles:
      [
        'td { position: relative; z-index: initial; }',
        'div.magic-menu { display: none; position: absolute; z-index: 10 }',
        'tr:hover div.magic-menu, tr.hovered div.magic-menu{ display: block; right: -3px; top: -7px; }'
      ],
  encapsulation: ViewEncapsulation.None
})
export class TableItemComponent {

  constructor(private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  @Input() keys: string;

  @Input() row: TableRow;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() delete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  @Input() queryparams = {};

  public navigateShow(key) {
    this.router.navigate([this.showRoute + this.getItem().getId()],
      {
        relativeTo: this.route,
        queryParams: this.queryparams
      });
  }

  buttonStyle() {
    return {
      // 'position': 'relative',
      // 'margin-top': '-30px',
      // 'margin-left': '10%',
      // 'display': 'inline-block',
      // 'float': 'right',
      // 'right': '0px',
      // 'z-index': '100000'
    };
  }

  public getItem() {
    return this.row.item;
  }

  public isLastKey(key) {
    return this.keys.indexOf(key) === this.keys.length - 1;
  }

  public printTemplate(row, key) {
    return row.getRowValue(key).template;
  }

  public printTranslate(row, key) {
    return !this.printTemplate(row, key) && !this.printBoolean(row, key) && row.getRowValue(key).translate;
  }

  public printRaw(row, key) {
    return !this.printTemplate(row, key) && !this.printBoolean(row, key) && !this.printTranslate(row, key);
  }

  public printBoolean(row, key) {
    return typeof(row.getRowValue(key).value) === 'boolean';
  }

  public sanitizedTemplateValue(row, key) {
    const html =  row.getRowValue(key).template(row.getRowValue(key).value);
    const sanitized = this.sanitizer.bypassSecurityTrustHtml(html);
    return sanitized;
  }

  public booleanValue(row, key) {
    return row.getRowValue(key).value;
  }

  public hasShow() {
    return this.getItem().hasAllowableActions(AllowableAction.CAN_GET_PROPERTIES);
  }

  public hasUpdate() {
    return !this.noEdit && this.getItem().hasAllowableActions(AllowableAction.CAN_UPDATE_PROPERTIES);
  }

  public hasUpdateValidity() {
    return this.hasEditValidita && !this.noEdit && this.getItem().hasAllowableActions(AllowableAction.CAN_UPDATE_PROPERTIES);
  }




}

