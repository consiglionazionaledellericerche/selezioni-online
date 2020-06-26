import { Component, Input } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { CmisObject } from '../../common/model/cmisobject.model';

@Component({
    selector: 'D:jconon_attachment:document',
    template: `
      <table class="table table-striped table-hover table-borderless">  
        <tbody>
          <tr><td class="font-weight-bolder">{{'name' | translate}}</td><td>{{data.name}}</td></tr>
          <tr><td class="font-weight-bolder">{{'title' | translate}}</td><td>{{data.title}}</td></tr>
          <tr><td class="font-weight-bolder">{{'description' | translate}}</td><td>{{data.description}}</td></tr>
        </tbody>  
      </table>
    `
  })
export class JcononAttachmentShowComponent implements AdMetadataComponent {
    @Input() data: CmisObject;
}