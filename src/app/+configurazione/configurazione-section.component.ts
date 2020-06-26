import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';


@Component({
  selector: 'app-configurazione-section',
  template:
  `
    <router-outlet></router-outlet>
  `
})
export class ConfigurazioneSectionComponent {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService) {
  }

}
