import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizeFirstPipe} from './pipes/capitalizefirst.pipe';
import { FirstLetterPipe } from './pipes/firstletter.pipe';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';

@NgModule({
  declarations: [
    // DropdownDirective
    CapitalizeFirstPipe,
    FirstLetterPipe,
    SafeHtmlPipe
  ],
  exports: [
    CommonModule,
    // DropdownDirective
    CapitalizeFirstPipe,
    FirstLetterPipe,
    SafeHtmlPipe
  ],
  providers: [
  ]
})
export class SharedModule {}
