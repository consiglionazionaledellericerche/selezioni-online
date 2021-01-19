import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';

import { JcononAttachmentCallShowComponent } from './attachment/jconon-attachment-call-show.component';
import { JcononAffixAnagraficaComponent } from './affix/anagrafica.component';
import { JcononAffixResidenzaComponent } from './affix/residenza.component';
import { JcononAffixDichiarazioniComponent } from './affix/dichiarazioni.component';
import { JcononAffixDichiarazioniConclusiveComponent } from './affix/dichiarazioni_conclusive.component';

import { JcononAspectPossessoRequisitiComponent } from './aspect/possesso-requisiti.component';
import { JcononAspectsDichiarazioneComponent } from './aspect/dichiarazione.component';
import { JcononAttachmentShowComponent } from './attachment/jconon-attachment-show.component';
import { JcononAttachmentDocumentoRiconoscimentoShowComponent } from './attachment/jconon-attachment-documento-riconoscimento-show.component';

import {ButtonsModule} from 'ngx-bootstrap/buttons'

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';

/**
 * Nel dynamic module inserisco tutti i components necessari alla gestione specifica di un tipo.
 */
@NgModule({
    declarations: [
        JcononAttachmentCallShowComponent,
        JcononAffixAnagraficaComponent,
        JcononAffixResidenzaComponent,
        JcononAffixDichiarazioniComponent,
        JcononAffixDichiarazioniConclusiveComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectsDichiarazioneComponent,
        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        TagsModule,
        ButtonsModule.forRoot(),
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: CustomHttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    entryComponents: [
        JcononAttachmentCallShowComponent,
        JcononAffixAnagraficaComponent,
        JcononAffixResidenzaComponent,
        JcononAffixDichiarazioniComponent,
        JcononAffixDichiarazioniConclusiveComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectsDichiarazioneComponent,
        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent
    ],
})
export class DynamicModule {}


// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}