import {
  Input, Directive
} from '@angular/core';
import {CmisObject} from '../../../common/model/cmisobject.model';
import {AuthService} from '../../../auth/auth.service';
import {ConfigService} from '../../../core/config.service';
import {Helpers} from '../../../common/helpers/helpers';
import {FormCommonTag} from './form-common-tag';
import { TranslateService } from '@ngx-translate/core';

// declare var jquery: any;   // not required
declare var $: any;   // not required
@Directive()
export abstract class Select2AngularComponent extends FormCommonTag {

  public static ADD_ANOTHER = 'Aggiungi altri elementi';

  public static SEARCHING_MARKUP = 'Sto cercando';

  public static ERROR_MARKUP = 'I risultati non';

  @Input() allowClear = false;

  @Input() path: string = null;     // relative path. Se popolato attiva la funzionalità ajax di select2.

  @Input() pathParams: {} = {};     // ajax params oltre il term di ricerca ex. { 'userId': '1'}

  @Input() template: () => string;

  @Input() baseBuilder;

  @Input() multiple = false;

  @Input() resultName: string = 'results';
  @Input() resultId: string = 'id';
  @Input() term: string = '*';

  id = 'select' + this.randomId();

  asyncInitialized = false;

  constructor(protected authService: AuthService,
              protected configService: ConfigService,
              protected translateService: TranslateService) {
    super();
  }

  protected abstract select(e);

  protected abstract unselect(e);

  protected abstract getSelected();

  /**
   * Inizializza la select2.
   *
   * TODO: se this.params cambia la select2 dovrà essere reinizializzata (in genere è fissato).
   */
  protected initializeSelect2() {

   const obj = {
      theme: 'bootstrap',
      width: null,
      debug: true,
      allowClear: this.allowClear,
      placeholder: this.placeholder,
      containerCssClass: ':all:',
      language: this.language()
    };

    obj['escapeMarkup'] = function(markup) {
      if (!markup) {
        return markup;
      }
      if (markup.startsWith(Select2AngularComponent.ERROR_MARKUP)) {
        return '<div><i class=\"fa fa-times text-danger\"></i>' +
          ' Impossibile recuperare i risultati della ricerca.<br>' +
          '<em>Riprovare o effettuare una segnalazione.</em></div>';
      }
      if (markup.startsWith(Select2AngularComponent.SEARCHING_MARKUP)) {
        return '<i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Sto cercando ...';
      }
      return markup;
    };

    if (this.template) {
      obj['templateResult'] = function(data) {
        if (data.loading) {
          return data.text;
        }
        if (data.entity) {
          return this.template(this.baseBuilder(data.entity));
        }
        if (data instanceof CmisObject) {
          return this.template(data); // TODO: verificarlo nel caso di not async.
        }
        return this.template(data, false, Select2AngularComponent.ADD_ANOTHER, this.translateService);
      }.bind(this);
      obj['templateSelection'] = function(data) {
        if (!this.selected && !data.id) {
          return this.placeholder;
        }
        if (this.selected && this.selected.entity) {
          return this.template(this.baseBuilder(this.selected.entity), true, Select2AngularComponent.ADD_ANOTHER);
        }
        return this.template(data, true, Select2AngularComponent.ADD_ANOTHER, this.translateService);
      }.bind(this);
    }

    const selector = this.cssSelector();

    if (this.path) {
      this.configService.getGateway().subscribe( gateway => {
          const resultName = this.resultName;
          const resultId = this.resultId;
          const term = this.term;
          obj['ajax'] = {
            'url': gateway + this.path,
            'delay': '600',
            'dataType': 'json',
            'transport': this.transport.bind(this),
            'data': function (params) {
              return {
                filter: term + params.term + term, // search term,                
              };
            },
            'processResults': function (data) {
              return {
                results: $.map(data[resultName], function(obj) {
                    return { id: obj[resultId], obj: obj };
                })
              };
            }
          };
          obj['minimumInputLength'] = 2;

          // l'inizializzazione async deve avvenire prima di costruire la select2, altrimenti si crea la option
          // visualizzata duplicata. Indagare se serve.
          this.asyncInitialValue();
          this.asyncInitialized = true;

          $(selector).select2(obj);
          $(selector).on('select2:select', this.select.bind(this));
          $(selector).on('select2:unselecting', this.unselect.bind(this));
      });

    } else {
      $(selector).select2(obj);
      $(selector).on('select2:select', this.select.bind(this));
      $(selector).on('select2:unselecting', this.unselect.bind(this));
      // on first focus (bubbles up to document), open the menu
    }

    this.fixDropDown();
  }

  /**
   * La chiamata ajax deve essere fatta con il token rinnovato ...
   * @param params
   * @param success
   * @param failure
   * @returns {Subscription}
   */
  public transport(params, success, failure) {
    params.url = params.url + Helpers.objToQueryParam(this.pathParams);
    return this.authService.getRefreshedToken().subscribe( (tok) => {
      params['headers'] = {'X-alfresco-ticket': tok.ticket};
      const $request = $.ajax(params);
      $request.then(success);
      $request.fail(failure);
      return $request;
    });
  }

  /**
   * Create the selected option and append to Select2 (single async version).
   */
  private asyncInitialValue() {
    if (!this.asyncInitialized && this.path && !this.multiple && this.getSelected()) {
      const selector = this.cssSelector();
      const selected = this.getSelected();
      const option = new Option(this.getSelected().getLabel(), this.getSelected().getId(), true, true);
      $(selector).append(option).trigger('change');
      // manually trigger the `select2:select` event
      $(selector).trigger({
        type: 'select2:select',
        params: {
          data: this.getSelected()
        }
      });
    }
  }

  // -----------------------------
  // Utils
  // -----------------------------

  private fixDropDown() {
    // FIX https://github.com/select2/select2/issues/4614
    const selector = this.cssSelector();
    const select2Instance = $(selector).data('select2');
    $(document).on('focus', '.select2-selection.select2-selection--single', function (e) {
      $(this).closest(".select2-container").siblings('select:enabled').select2('open');
    });
    $(selector).one('select2:open', function(e) {
      $('input.select2-search__field').prop('placeholder', 'Cerca opzioni');
    });
  }


  randomId() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
  }

  cssSelector() {
    return '.' + this.id;
  }

  protected language() {
    // FIXME: integrare la traduzione select2.
    // * Questa traduzione è copiata dalla dist di select2.
    // Italian
    return {
      errorLoading: function () {
        return 'I risultati non possono essere caricati.';
      },
      inputTooLong: function (args) {
        const overChars = args.input.length - args.maximum;

        let message = 'Per favore cancella ' + overChars + ' caratter';

        if (overChars !== 1) {
          message += 'i';
        } else {
          message += 'e';
        }

        return message;
      },
      inputTooShort: function (args) {
        const remainingChars = args.minimum - args.input.length;

        const message = 'Per favore inserisci ' + remainingChars + ' o più caratteri';

        return message;
      },
      loadingMore: function () {
        return 'Caricando più risultati…';
      },
      maximumSelected: function (args) {
        let message = 'Puoi selezionare solo ' + args.maximum + ' element';

        if (args.maximum !== 1) {
          message += 'i';
        } else {
          message += 'o';
        }

        return message;
      },
      noResults: function () {
        return 'Nessun risultato trovato';
      },
      searching: function () {
        return 'Sto cercando…';
      }
    };
  }
}
