import { Component, Input } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { Attachment } from '../../common/model/attachment.model';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'D:jconon_attachment:call_it',
    template: `
      <table class="table table-striped table-hover table-borderless">  
        <tbody>
          <tr><td class="fw-bolder">{{'name' | translate}}</td><td>{{data.name}}</td></tr>
          <tr><td class="fw-bolder">{{'title' | translate}}</td><td>{{data.title}}</td></tr>
          <tr><td class="fw-bolder">{{'description' | translate}}</td><td>{{data.description}}</td></tr>
          <tr><td class="fw-bolder">{{'protocollo.data' | translate}}</td><td>{{data.dataProtocollo | date:'dd/MM/yyyy'}}</td></tr>
          <tr><td class="fw-bolder">{{'protocollo.numero' | translate}}</td><td>{{data.numeroProtocollo}}</td></tr>
        </tbody>  
      </table>
    `
  })
export class JcononAttachmentCallShowComponent implements AdMetadataComponent {
    @Input() data: Attachment;
    @Input() form: FormGroup;
}