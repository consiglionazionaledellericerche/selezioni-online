import { Component, Input } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { DocumentoRiconoscimento } from '../../common/model/documento_riconoscimento.model';

@Component({
    selector: 'D:jconon_documento_riconoscimento:attachment',
    template: `
      <table class="table table-striped table-hover table-borderless">  
        <tbody>
          <tr>
            <td class="font-weight-bolder">{{'document.docummento_riconoscimento.tipologia' | translate}}</td>
            <td>{{data.tipologia}}</td>
          </tr>
          <tr>
            <td class="font-weight-bolder">{{'document.docummento_riconoscimento.numero' | translate}}</td>
            <td>{{data.numero}}</td>
          </tr>
          <tr>
            <td class="font-weight-bolder">{{'document.docummento_riconoscimento.data_scadenza' | translate}}</td>
            <td>{{data.data_scadenza | date:'dd/MM/yyyy'}}</td>
          </tr>
          <tr>
            <td class="font-weight-bolder">{{'document.docummento_riconoscimento.rilasciato_da' | translate}}</td>
            <td>{{data.emittente}}</td>
          </tr>
          <tr><td class="font-weight-bolder">{{'name' | translate}}</td><td>{{data.name}}</td></tr>
          <tr><td class="font-weight-bolder">{{'title' | translate}}</td><td>{{data.title}}</td></tr>
          <tr><td class="font-weight-bolder">{{'description' | translate}}</td><td>{{data.description}}</td></tr>
        </tbody>  
      </table>
    `
  })
export class JcononAttachmentDocumentoRiconoscimentoShowComponent implements AdMetadataComponent {
    @Input() data: DocumentoRiconoscimento;
}