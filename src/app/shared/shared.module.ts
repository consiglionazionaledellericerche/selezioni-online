import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CapitalizeFirstPipe} from './pipes/capitalizefirst.pipe';
import {SafeHtmlPipe} from './pipes/safehtml.pipe';

@NgModule({
  declarations: [
    // DropdownDirective
    CapitalizeFirstPipe,
    SafeHtmlPipe
  ],
  exports: [
    CommonModule,
    // DropdownDirective
    CapitalizeFirstPipe,
    SafeHtmlPipe
  ],
  providers: [
  ]
})
export class SharedModule {}
