import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-button-save',
  template: '<button type="submit" class="btn btn-sm btn-info" [disabled]="disable"> {{ "save" | translate }}</button>'
})
export class ButtonSaveComponent {

  @Input() disable: boolean;

}

