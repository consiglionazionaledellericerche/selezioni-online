import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {ConfigurazioneRoutingModule} from './configurazione-routing.module';
import {ConfigurazioneComponent} from './configurazione.component';
import {ConfigurazioneItemComponent} from './configurazione-item.component';
import {ConfigurazioneSectionComponent} from './configurazione-section.component';

import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

@NgModule({
  declarations: [

    ConfigurazioneSectionComponent,

    ConfigurazioneComponent,
    ConfigurazioneItemComponent,


  ],
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    
    FormsModule,
    ReactiveFormsModule,

    SharedModule,

    ConfigurazioneRoutingModule,

  ],
  providers: [
    // Servizi necessari solo al ConfigurazioneModule.
  ]

})
export class ConfigurazioneModule {}
