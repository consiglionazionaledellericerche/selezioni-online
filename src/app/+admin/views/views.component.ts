import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../admin.service';

/**
 * Ispettore delle viste bulkInfo (ex pagina legacy editView, che era in sola lettura):
 * albero dei tipi documentali e definizioni form/find/column del tipo selezionato.
 */
@Component({
  standalone: false,
  selector: 'app-admin-views',
  template: `
    <div class="row">
      <div class="col-lg-4 mb-3">
        <div class="form-group">
          <label for="v-filter" class="active" translate>admin.views.filter</label>
          <input id="v-filter" type="text" class="form-control" [(ngModel)]="filter">
        </div>
        <app-layout-wait [loaded]="tree"></app-layout-wait>
        <div class="border rounded p-2 tree-box" *ngIf="tree">
          <ng-container *ngTemplateOutlet="nodes; context: {$implicit: tree, level: 0}"></ng-container>
        </div>
        <ng-template #nodes let-items let-level="level">
          <ul class="list-unstyled mb-0" [style.padding-left.rem]="level ? 1 : 0">
            <ng-container *ngFor="let node of items">
              <li *ngIf="matches(node)">
                <a href="javascript:" class="small" [ngClass]="{'fw-bold text-primary': selected === node.attr?.id}"
                   (click)="select(node.attr?.id)">{{node.data}}</a>
                <small class="text-muted ms-1">{{node.attr?.id}}</small>
                <ng-container *ngIf="node.children?.length">
                  <ng-container *ngTemplateOutlet="nodes; context: {$implicit: node.children, level: level + 1}"></ng-container>
                </ng-container>
              </li>
            </ng-container>
          </ul>
        </ng-template>
      </div>
      <div class="col-lg-8">
        <div *ngIf="!selected" class="alert alert-light" translate>admin.views.select</div>
        <div *ngIf="selected">
          <h5 class="font-monospace">{{selected}}</h5>
          <ul class="nav nav-tabs mb-2">
            <li class="nav-item" *ngFor="let kind of kinds">
              <a class="nav-link" href="javascript:" [ngClass]="{'active': kind === currentKind}"
                 (click)="currentKind = kind">{{'admin.views.' + kind | translate}}</a>
            </li>
          </ul>
          <app-layout-wait [loaded]="views"></app-layout-wait>
          <pre *ngIf="views" class="bg-light p-2 small json-box">{{views[currentKind] | json}}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    '.tree-box { max-height: 70vh; overflow: auto; }',
    '.json-box { max-height: 70vh; overflow: auto; }'
  ]
})
export class ViewsComponent implements OnInit {

  public kinds = ['form', 'find', 'column'];
  public currentKind = 'form';
  public tree: any[];
  public selected: string;
  public views: {[kind: string]: any};
  public filter = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.typesTree().subscribe(tree => this.tree = tree || [], () => this.tree = []);
  }

  matches(node: any): boolean {
    const term = (this.filter || '').toLowerCase();
    if (!term) {
      return true;
    }
    const self = (node.data || '').toLowerCase().indexOf(term) !== -1 ||
      ((node.attr && node.attr.id) || '').toLowerCase().indexOf(term) !== -1;
    return self || (node.children || []).some(child => this.matches(child));
  }

  select(type: string) {
    if (!type) {
      return;
    }
    this.selected = type;
    this.views = undefined;
    forkJoin(this.kinds.map(kind =>
      this.adminService.bulkInfo(type, kind).pipe(catchError(() => of(null))))
    ).subscribe(results => {
      this.views = {};
      this.kinds.forEach((kind, index) => this.views[kind] = results[index]);
    });
  }
}
