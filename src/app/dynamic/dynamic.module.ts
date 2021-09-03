import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { JcononAttachmentCallShowComponent } from './attachment/jconon-attachment-call-show.component';
import { JcononAffixAnagraficaComponent } from './affix/anagrafica.component';
import { JcononAffixResidenzaComponent } from './affix/residenza.component';
import { JcononAffixDichiarazioniComponent } from './affix/dichiarazioni.component';
import { JcononAffixAllegatiComponent } from './affix/allegati.component';
import { JcononAffixDichiarazioniConclusiveComponent } from './affix/dichiarazioni_conclusive.component';
import { JcononAffixReperibilitaComponent } from './affix/reperibilita.component';

import { JcononAffixCallDetailComponent } from './affix/call-detail.component';

import { JcononAspectPossessoRequisitiComponent } from './aspect/possesso-requisiti.component';
import { JcononAspectsDichiarazioneComponent } from './aspect/dichiarazione.component';
import { JcononAttachmentShowComponent } from './attachment/jconon-attachment-show.component';
import { JcononAttachmentDocumentoRiconoscimentoShowComponent } from './attachment/jconon-attachment-documento-riconoscimento-show.component';

import { JcononAttachmentEditComponent } from './attachment/jconon-attachment-edit.component';
import { JcononAttachmentDocumentoRiconoscimentoEditComponent } from './attachment/jconon-attachment-documento-riconoscimento-edit.component';

import {ButtonsModule} from 'ngx-bootstrap/buttons'
import { AccordionModule } from 'ngx-bootstrap/accordion';

// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';


import { JcononAspectIscrizioneListeElettoraliComponent } from './aspect/iscrizione-liste-elettorali.component';
import { JcononAspectGodimentoDirittiComponent } from './aspect/godimento-diritti.component';
import { JcononAspectCondannePenaliComponent } from './aspect/condanne-penali.component';
import { JcononAspectDecadutoAltroImpiegoComponent } from './aspect/decaduto-altro-impiego.component';
import { JcononAspectDestituitoAltroImpiegoComponent } from './aspect/destituito-altro-impiego.component';
import { JcononAspectServizioCNRComponent } from './aspect/servizio-cnr.component';
import { JcononAspectServizioAltreAmministrazioniComponent } from './aspect/servizio-altre-amministrazioni.component';
import { JcononAspectTitoloRiservaPostiComponent } from './aspect/titolo-riserva-posti.component';
import { JcononAspectDiplomaComponent } from './aspect/diploma.component';
import { JcononAspectLaureaComponent } from './aspect/laurea.component';
import { JcononAspectDottoratoComponent } from './aspect/dottorato.component';
import { JcononAspectDiversmenteAbileComponent } from './aspect/diversamente-abile.component';
import { JcononAspectTempiAggiuntiviComponent } from './aspect/tempi-aggiuntivi.component';
import { JcononAspectAltreBorseStudioComponent } from './aspect/altre-borse-studio.component';
import { JcononAspectAreaScientificaComponent } from './aspect/area-scientifica.component';
import { JcononAspectSettoreScientificoTecnologicoComponent } from './aspect/settore-scientifico-tecnologico.component';
import { JcononAspectInquadramentoComponent } from './aspect/inquadramento.component';
import { JcononAspectStrutturaAppartenenzaComponent } from './aspect/struttura-appartenenza.component';
import { JcononAspectHIndexComponent } from './aspect/h-index.component';
import { JcononAspectServizioAltraAttivitaComponent } from './aspect/servizio-altra-attivita.component';
import { JcononAspectPossessoCittadinanzaComponent } from './aspect/possesso-cittadinanza.component';
import { JcononAspectCategorieRiservatarieArt1Component } from './aspect/categorie-riservatarie-art1.component';
import { JcononAspectCategorieRiservatarieArt18Component } from './aspect/categorie-riservatarie-art18.component';
import { JcononAspectPatenteGuidaComponent } from './aspect/patente-guida.component';
import { JcononAspectAttoInterruttivoAnzianitaComponent } from './aspect/atto-interruttivo-anzianita.component';
import { JcononAspectTitoloPreferenzaPostiComponent } from './aspect/titolo-preferenza-posti.component';
import { JcononAspectConoscenzaLingueComponent } from './aspect/conoscenza-lingue.component';
import { JcononAspectSedeComponent } from './aspect/sede.component';
import { JcononAspectSanzioneDisciplinareComponent } from './aspect/sanzione-disciplinare.component';
import { JcononAspectSpecializzazioneComponent } from './aspect/specializzazione.component';
import { JcononAspectEnteCompartoRicercaAppartenenzaComponent } from './aspect/ente-comparto-ricerca-appartenenza.component';
import { JcononAspectEnteCompartoUniversitaAppartenenzaComponent } from './aspect/ente-comparto-universita-appartenenza.component';
import { JcononAspectEnteAppartenenzaComponent } from './aspect/ente-appartenenza.component';
import { JcononAspectSingleFieldComponent } from './aspect/single-field.component';
import { JcononAspectAreaTecnicaComponent } from './aspect/area-tecnica.component';
import { JcononAspectToggleWithSingleFieldComponent } from './aspect/toggle-with-single-field.component';
import { JcononAspectContrattoTDConcorsoComponent } from './aspect/contratto-td-concorso.component';
import { JcononAspectIdoneoPrecedentiGraduatorieComponent } from './aspect/idoneo-precedenti-graduatorie.component';
import { JcononAspectAbilitazioneProfessioneIngegnereComponent } from './aspect/abilitazione-professione-ingegnere.component';
import { JcononAspectUlterioreLaureaComponent } from './aspect/ulteriore-laurea.component';
import { JcononAspectUlterioreDottoratoComponent } from './aspect/ulteriore-dottorato.component';
import { ConfigService } from '../core/config.service';

/**
 * Nel dynamic module inserisco tutti i components necessari alla gestione specifica di un tipo.
 */
@NgModule({
    declarations: [
        JcononAttachmentCallShowComponent,
        JcononAffixAnagraficaComponent,
        JcononAffixResidenzaComponent,
        JcononAffixDichiarazioniComponent,
        JcononAffixAllegatiComponent,
        JcononAffixDichiarazioniConclusiveComponent,
        JcononAffixReperibilitaComponent,

        JcononAffixCallDetailComponent,
        /** Application Aspect */
        JcononAspectsDichiarazioneComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectIscrizioneListeElettoraliComponent,
        JcononAspectGodimentoDirittiComponent,
        JcononAspectCondannePenaliComponent,
        JcononAspectDecadutoAltroImpiegoComponent,
        JcononAspectDestituitoAltroImpiegoComponent,
        JcononAspectServizioCNRComponent,
        JcononAspectServizioAltreAmministrazioniComponent,
        JcononAspectTitoloRiservaPostiComponent,
        JcononAspectDiplomaComponent,
        JcononAspectLaureaComponent,
        JcononAspectDottoratoComponent,
        JcononAspectDiversmenteAbileComponent,
        JcononAspectTempiAggiuntiviComponent,
        JcononAspectAltreBorseStudioComponent,
        JcononAspectAreaScientificaComponent,
        JcononAspectSettoreScientificoTecnologicoComponent,
        JcononAspectInquadramentoComponent,
        JcononAspectStrutturaAppartenenzaComponent,
        JcononAspectHIndexComponent,
        JcononAspectServizioAltraAttivitaComponent,
        JcononAspectPossessoCittadinanzaComponent,
        JcononAspectCategorieRiservatarieArt1Component,
        JcononAspectCategorieRiservatarieArt18Component,
        JcononAspectPatenteGuidaComponent,
        JcononAspectAttoInterruttivoAnzianitaComponent,
        JcononAspectTitoloPreferenzaPostiComponent,
        JcononAspectConoscenzaLingueComponent,
        JcononAspectSedeComponent,
        JcononAspectSanzioneDisciplinareComponent,
        JcononAspectSpecializzazioneComponent,
        JcononAspectEnteCompartoRicercaAppartenenzaComponent,
        JcononAspectEnteCompartoUniversitaAppartenenzaComponent,
        JcononAspectEnteAppartenenzaComponent,
        JcononAspectSingleFieldComponent,
        JcononAspectAreaTecnicaComponent,
        JcononAspectToggleWithSingleFieldComponent,
        JcononAspectContrattoTDConcorsoComponent,
        JcononAspectIdoneoPrecedentiGraduatorieComponent,
        JcononAspectAbilitazioneProfessioneIngegnereComponent,
        JcononAspectUlterioreLaureaComponent,
        JcononAspectUlterioreDottoratoComponent,

        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent,

        JcononAttachmentEditComponent,
        JcononAttachmentDocumentoRiconoscimentoEditComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        TagsModule,
        CKEditorModule,
        ButtonsModule.forRoot(),
        AccordionModule.forRoot(),
        TranslateModule.forChild({
            compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
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
        JcononAffixAllegatiComponent,
        JcononAffixDichiarazioniConclusiveComponent,
        JcononAffixReperibilitaComponent,

        JcononAffixCallDetailComponent,
        /** Application Aspect */
        JcononAspectsDichiarazioneComponent,
        JcononAspectPossessoRequisitiComponent,
        JcononAspectIscrizioneListeElettoraliComponent,
        JcononAspectGodimentoDirittiComponent,
        JcononAspectCondannePenaliComponent,
        JcononAspectDecadutoAltroImpiegoComponent,
        JcononAspectDestituitoAltroImpiegoComponent,
        JcononAspectServizioCNRComponent,
        JcononAspectServizioAltreAmministrazioniComponent,
        JcononAspectTitoloRiservaPostiComponent,
        JcononAspectDiplomaComponent,
        JcononAspectLaureaComponent,
        JcononAspectDottoratoComponent,
        JcononAspectDiversmenteAbileComponent,
        JcononAspectTempiAggiuntiviComponent,
        JcononAspectAltreBorseStudioComponent,
        JcononAspectAreaScientificaComponent,
        JcononAspectSettoreScientificoTecnologicoComponent,
        JcononAspectInquadramentoComponent,
        JcononAspectStrutturaAppartenenzaComponent,
        JcononAspectHIndexComponent,
        JcononAspectServizioAltraAttivitaComponent,
        JcononAspectPossessoCittadinanzaComponent,
        JcononAspectCategorieRiservatarieArt1Component,
        JcononAspectCategorieRiservatarieArt18Component,
        JcononAspectPatenteGuidaComponent,
        JcononAspectAttoInterruttivoAnzianitaComponent,
        JcononAspectTitoloPreferenzaPostiComponent,
        JcononAspectConoscenzaLingueComponent,
        JcononAspectSedeComponent,
        JcononAspectSanzioneDisciplinareComponent,
        JcononAspectSpecializzazioneComponent,
        JcononAspectEnteCompartoRicercaAppartenenzaComponent,
        JcononAspectEnteCompartoUniversitaAppartenenzaComponent,
        JcononAspectEnteAppartenenzaComponent,
        JcononAspectSingleFieldComponent,
        JcononAspectAreaTecnicaComponent,
        JcononAspectToggleWithSingleFieldComponent,
        JcononAspectContrattoTDConcorsoComponent,
        JcononAspectIdoneoPrecedentiGraduatorieComponent,
        JcononAspectAbilitazioneProfessioneIngegnereComponent,
        JcononAspectUlterioreLaureaComponent,
        JcononAspectUlterioreDottoratoComponent,

        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent,

        JcononAttachmentEditComponent,
        JcononAttachmentDocumentoRiconoscimentoEditComponent
    ],
})
export class DynamicModule {}


// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
    return new ConfigService(http);
}