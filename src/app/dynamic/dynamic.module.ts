import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import { JcononAttachmentCallShowComponent } from './attachment/jconon-attachment-call-show.component';
import { JcononAttachmentShowComponent } from './attachment/jconon-attachment-show.component';
import { JcononAttachmentDocumentoRiconoscimentoShowComponent } from './attachment/jconon-attachment-documento-riconoscimento-show.component';

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
        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent
    ],
    imports: [
        CommonModule,
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
        JcononAttachmentShowComponent,
        JcononAttachmentDocumentoRiconoscimentoShowComponent
    ],
})
export class DynamicModule {}


// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}