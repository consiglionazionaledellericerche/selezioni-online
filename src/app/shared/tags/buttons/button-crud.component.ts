import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-button-crud',
  template: `
    <app-buttons-layout>

        <app-button-cancel [queryParams]="queryParams" [route]="backRoute" [fragment]="fragment"></app-button-cancel>
        <app-button-save [disable]="!valid"></app-button-save>

        <app-button-delete *ngIf="showDelete()"
          [entity]="entity"
          [showLabel]="true"
          [classes]="{ 'float-right': true}"
          (confirm)="onDelete()"
        ></app-button-delete>

      </app-buttons-layout>
  `
})
export class ButtonCrudComponent {

  @Input() backRoute = '..';

  @Input() fragment = null;

  @Input() entity;

  @Input() valid = true;

  @Input() noDelete = false;

  @Input() queryParams = {};

  @Output() delete = new EventEmitter();


  public onDelete() {
    this.delete.emit();
  }

  public showDelete() {
    return this.entity && !this.noDelete;
  }

}

