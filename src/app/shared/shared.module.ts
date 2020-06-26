import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TagsModule} from './tags/tags.module';
import {CapitalizeFirstPipe} from './pipes/capitalizefirst.pipe';

@NgModule({
  declarations: [
    // DropdownDirective
    CapitalizeFirstPipe
  ],
  imports: [
    TagsModule
  ],
  exports: [
    CommonModule,
    TagsModule,
    // DropdownDirective
    CapitalizeFirstPipe
  ],
  providers: [
  ]
})
export class SharedModule {}
