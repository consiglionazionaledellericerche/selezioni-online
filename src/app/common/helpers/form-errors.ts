import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

const escape = (text: string) => String(text)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Nome leggibile di un campo del form: traduzione ("label.<proprietà>"), altrimenti l'etichetta
 * mostrata nella pagina, altrimenti il nome della proprietà.
 */
export function fieldLabel(control: string, translate: TranslateService, root: Element): string {
  const key = 'label.' + control.replace(/:/g, '.');
  const translated = translate.instant(key);
  if (translated && translated !== key) {
    return translated;
  }
  const element = root.querySelector('[formcontrolname="' + control + '"]');
  const container = element && element.closest('.form-group, app-control-toggle, a.it-has-checkbox, .generic-field, .row');
  const label = container && container.querySelector('label');
  const text = label && label.textContent ? label.textContent.replace(/\s+/g, ' ').trim() : '';
  if (text) {
    return text;
  }
  const name = control.split(':').pop() || control;
  return name.replace(/^fl_/, '').replace(/_/g, ' ');
}

/** Messaggio HTML con i campi da correggere (al più 8 elencati). */
export function invalidFieldsMessage(form: FormGroup, translate: TranslateService, root: Element): string {
  const labels = Object.keys(form.controls)
    .filter(control => form.controls[control].invalid)
    .map(control => fieldLabel(control, translate, root))
    .filter((label, i, all) => all.indexOf(label) === i);
  const shown = labels.slice(0, 8).map(label => '<li>' + escape(label) + '</li>').join('');
  const more = labels.length > 8 ? '<li>' + escape(translate.instant('message.form.invalid_more', { value: labels.length - 8 })) + '</li>' : '';
  return escape(translate.instant('message.form.invalid_intro', { value: labels.length })) +
    '<ul>' + shown + more + '</ul>' +
    '<div class="mt-1">' + escape(translate.instant('message.form.invalid_hint')) + '</div>';
}
