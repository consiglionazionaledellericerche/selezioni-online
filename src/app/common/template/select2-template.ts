import {Legend} from '../model/legend.model';
import { TranslateService } from '@ngx-translate/core';

export class Select2Template {

  public static icon(faicon, color) {
    return '<i class=\"fa fa-' + faicon + ' ' + color + '\" aria-hidden=\"true\"></i>';
  }

  private static userIcon(entity, color): string {
    const html =  Select2Template.icon('user', color);
    return html;
  }

  private static callIcon(entity, color): string {
    const html =  Select2Template.icon('cube', color);
    return html;
  }

  public static user(entity, selection: boolean, placeholder: string): string {
    if (entity instanceof Array) {
      return placeholder;
    }
    if (selection) {
      return Select2Template.userIcon(entity, 'text-primary') + ' ' + entity.obj.userName;
    } else {
      let html = 
        '<div class="d-sm-flex align-items-start">'
        +   '<div class="me-1 text-primary">'
        +    Select2Template.userIcon(entity, 'info') 
        + '</div><div>';
      html += '<span class="text-primary"><h5>' + entity.obj.userName + '</h5></span>';
      html += '<span>' + entity.obj.lastName + '</span>';
      html += '<span class="ps-1">' + entity.obj.firstName + '</span>';
      html += '<br><small>  ' + entity.obj.email + '</small>';
      html += '</div></div>';
      return html;
    }
  }

  public static call(entity, selection: boolean, placeholder: string, translateService: TranslateService): string {
    if (entity instanceof Array) {
      return placeholder;
    }
    if (selection) {
      return Select2Template.callIcon(entity, 'text-primary') + ' ' + (entity.text || entity.obj['jconon_call:codice']);
    } else {
      let html = '<div class="align-items-start">';
      html += '<div class="d-sm-flex me-1 text-primary">'
      html += Select2Template.callIcon(entity, 'info'); 
      html += '<div class="ps-1 text-primary h6">' + entity.obj['jconon_call:codice'] + '</div>';
      html += '</div>';
      translateService.get(entity.obj['cmis:objectTypeId']).subscribe((label) => {
        html += '<div class="fst-italic">' + label + '</div>';
      });
      if (entity.obj['jconon_call:profilo']) {
        translateService.get('call.profilo').subscribe((label) => {
          html += '<div class="text-truncate"><span>' + label + '</span><span class="ps-1 fw-bold">'+entity.obj['jconon_call:profilo']+'</span></div>';
        });  
      }
      if (entity.obj['jconon_call:sede']) {
        translateService.get('call.sede').subscribe((label) => {
          html += '<div class="text-truncate"><span>' + label + '</span><span class="ps-1 fw-bold">'+entity.obj['jconon_call:sede']+'</span></div>';
        });  
      }
      if (entity.obj['jconon_call:struttura_destinataria']) {
        translateService.get('call.struttura').subscribe((label) => {
          html += '<div class="text-truncate"><span>' + label + '</span><span class="ps-1 fw-bold">'+entity.obj['jconon_call:struttura_destinataria']+'</span></div>';
        });
      }
      html += '</div>';
      return html;
    }
  }

  private static escape(value: any): string {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  public static comuni(entity, selection: boolean, placeholder: string): string {
    if (entity instanceof Array) {
      return placeholder;
    }
    if (selection) {
      return entity.id;
    } else {
      const comune = entity.obj || {};
      let html = '<div class="align-items-start">';
      html += '<span class="fw-bold">' + Select2Template.escape(comune.nomeComune) + '</span>';
      html += '<span> [' + Select2Template.escape(comune.provincia) + ']</span>';
      // comune soppresso (archivio ANPR): utile per i luoghi di nascita, va riconosciuto a colpo d'occhio
      if (comune.dataCessazione) {
        const anno = String(comune.dataCessazione).substring(0, 4);
        html += ' <span class="badge bg-secondary ms-1">soppresso nel ' + Select2Template.escape(anno) + '</span>';
      }
      html += '</div>';
      return html;
    }
  }

}
