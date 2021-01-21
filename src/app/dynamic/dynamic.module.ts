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

import { JcononAspectIscrizioneListeElettoraliComponent } from './aspect/iscrizione-liste-elettorali.component';
import { JcononAspectGodimentoDirittiComponent } from './aspect/godimento-diritti.component';
import { JcononAspectCondannePenaliComponent } from './aspect/condanne-penali.component';
import { JcononAspectDecadutoAltroImpiegoComponent } from './aspect/decaduto-altro-impiego.component';
import { JcononAspectDestituitoAltroImpiegoComponent } from './aspect/destituito-altro-impiego.component';
import { JcononAspectServizioCNRComponent } from './aspect/servizio-cnr.component';
import { JcononAspectServizioAltreAmministrazioniComponent } from './aspect/servizio-altre-amministrazioni.component';

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
        /** Apllication Aspect */
        JcononAspectsDichiarazioneComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectIscrizioneListeElettoraliComponent,
        JcononAspectGodimentoDirittiComponent,
        JcononAspectCondannePenaliComponent,
        JcononAspectDecadutoAltroImpiegoComponent,
        JcononAspectDestituitoAltroImpiegoComponent,
        JcononAspectServizioCNRComponent,
        JcononAspectServizioAltreAmministrazioniComponent,


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
        /** Apllication Aspect */
        JcononAspectsDichiarazioneComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectIscrizioneListeElettoraliComponent,
        JcononAspectGodimentoDirittiComponent,
        JcononAspectCondannePenaliComponent,
        JcononAspectDecadutoAltroImpiegoComponent,
        JcononAspectDestituitoAltroImpiegoComponent,
        JcononAspectServizioCNRComponent,
        JcononAspectServizioAltreAmministrazioniComponent,

        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent
    ],
})
export class DynamicModule {}


// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}