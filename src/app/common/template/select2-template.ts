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
        +   '<div class="mr-1 text-primary">'
        +    Select2Template.userIcon(entity, 'info') 
        + '</div><div>';
      html += '<span class="text-primary"><h5>' + entity.obj.userName + '</h5></span>';
      html += '<span>' + entity.obj.lastName + '</span>';
      html += '<span class="pl-1">' + entity.obj.firstName + '</span>';
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
      html += '<div class="d-sm-flex mr-1 text-primary">'
      html += Select2Template.callIcon(entity, 'info'); 
      html += '<div class="pl-1 text-primary h6">' + entity.obj['jconon_call:codice'] + '</div>';
      html += '</div>';
      translateService.get(entity.obj['cmis:objectTypeId']).subscribe((label) => {
        html += '<div class="font-italic">' + label + '</div>';
      });
      translateService.get('call.sede').subscribe((label) => {
        html += '<div class="text-truncate"><span>' + label + '</span><span class="pl-1 font-weight-bold">'+entity.obj['jconon_call:sede']+'</span></div>';
      });
      translateService.get('call.struttura').subscribe((label) => {
        html += '<div class="text-truncate"><span>' + label + '</span><span class="pl-1 font-weight-bold">'+entity.obj['jconon_call:struttura_destinataria']+'</span></div>';
      });
      html += '</div>';
      return html;
    }
  }

  public static comuni(entity, selection: boolean, placeholder: string): string {
    if (entity instanceof Array) {
      return placeholder;
    }
    if (selection) {
      return entity.id;
    } else {
      let html = '<div class="align-items-start">';
      html += '<span class="font-weight-bold">' + entity.obj.nomeComune + '</span>';
      html += '<span> [' + entity.obj.provincia + ']</span>';
      html += '</div>';
      return html;
    }
  }

}
