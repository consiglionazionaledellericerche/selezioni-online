import { BRAND } from '../../../brand/brand';
import { ObjectType } from '../../common/model/object-type.model';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { ModalService } from '../../shared/modal/modal.service';
import { ManageCallService } from '../call/manage-call.service';
import { ExportCallsComponent } from '../call/shared/export-calls.component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CacheService} from '../cache.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Profile } from '../../common/model/profile.enum.';

@Component({
  standalone: false,
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.component.html',
  styles: [`
    .filters { margin-top: 1.6rem; }
    .filters-title { font-size: .875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .75rem; }
    .filters .form-group { margin-top: 1.5rem; }
    .plain-input { border: 1px solid #d9dadb !important; border-radius: 4px; padding: .3rem .5rem; height: 2.25rem; }
  `]
})
export class SearchComponent implements OnInit, OnDestroy{
  public callStates = [
    { value: 'active', label: 'layout.state_open' },
    { value: 'expire', label: 'layout.state_closed' },
    { value: 'all', label: 'layout.state_all' }
  ];

  
  cache: any = {};

  public filterFormSearch: FormGroup;
  public callCode: String;
  public profiles: Profile[] = Profile.values();
  public collapse: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private modalService: ModalService,
              private route: ActivatedRoute,
              protected router: Router,
              private cacheService: CacheService,
              private translateService: TranslateService) {
    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.callCode = queryParams['callCode'];
      this.collapse = (this.callCode == undefined || this.callCode == '');
      this.filterFormSearch = this.formBuilder.group({
        callCode: new FormControl(this.callCode),
        filterType: new FormControl('all'),
        type: new FormControl('jconon_call:folder'),
        inizioScadenza: new FormControl(''),
        fineScadenza: new FormControl(''),
        profile: new FormControl(''),
        gazzetteNumber: new FormControl(''),
        gazzetteDate: new FormControl(''),
        requirements: new FormControl(''),
        struttura: new FormControl(''),
        sede: new FormControl(''),
        numeroPosti: new FormControl(''),
        newGazzetteNumber: new FormControl(''),
        newGazzetteDate: new FormControl(''),
        dallaDataInPA: new FormControl(''),
        allaDataInPA: new FormControl(''),
        dallaDataGraduatoria: new FormControl(''),
        allaDataGraduatoria: new FormControl(''),
        extraFilters: new FormControl([]),
        orderBy: new FormControl('scadenza'),
        orderDirection: new FormControl('desc'),
      });
    });
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
  }

  // -------------------------------
  // On Destroy.
  // -------------------------------

  public ngOnDestroy() {
  }


  /** Estrazioni Excel dei bandi filtrati: solo amministratori (gruppo ADMIN) e gruppo CONCORSI. */
  public canExport(): boolean {
    const user: any = this.authService.isAuthenticated() ? this.authService.getUser() : null;
    return ManageCallService.isConcorsi(user);
  }

  public openExport(): void {
    this.modalService.show(ExportCallsComponent, { initialState: { filters: this.filterFormSearch.value }, class: 'modal-lg' });
  }

  public sortOptions = [
    { value: 'scadenza', label: 'layout.sort.deadline' },
    { value: 'inizio', label: 'layout.sort.start' },
    { value: 'gazzetta', label: 'layout.sort.gazette' },
    { value: 'codice', label: 'layout.sort.code' },
    { value: 'creazione', label: 'layout.sort.created' }
  ];

  /** Etichetta della tipologia: traduzione, etichetta del backend o testo leggibile dalla chiave. */
  public typeLabel(item: any): string {
    const translated = this.translateService.instant(item.key);
    if (translated && translated !== item.key) {
      return translated;
    }
    const label = item.label || item.defaultLabel;
    return label && label !== item.key ? label : ObjectType.readable(item.key);
  }

  /** Filtri in più dell'installazione (src/brand): una scelta per filtro, inviata come "proprietà~valore". */
  public readonly extraFilters = BRAND.search?.extraFilters || [];
  private extraSelection: { [name: string]: string } = {};

  /** Filtri mostrati: tutti, tranne quelli che l'installazione nasconde (BRAND.search.hidden). */
  public shows(name: string): boolean {
    return !(BRAND.search?.hidden || []).includes(name);
  }

  public isExtraSelected(name: string, value: string): boolean {
    return this.extraSelection[name] === value;
  }

  public toggleExtra(name: string, value: string): void {
    this.extraSelection[name] = this.extraSelection[name] === value ? undefined : value;
    const filters = this.extraFilters
      .filter(filter => this.extraSelection[filter.name])
      .map(filter => filter.property + (filter.operator === 'like' ? '~' : '=') + this.extraSelection[filter.name]);
    this.filterFormSearch.controls['extraFilters'].setValue(filters);
  }

  public resetFilters(): void {
    this.extraSelection = {};
    this.filterFormSearch.reset({
      callCode: '', filterType: 'all', type: 'jconon_call:folder', inizioScadenza: '', fineScadenza: '', profile: '',
      gazzetteNumber: '', gazzetteDate: '', requirements: '', struttura: '', sede: '', extraFilters: [],
      numeroPosti: '', newGazzetteNumber: '', newGazzetteDate: '', dallaDataInPA: '', allaDataInPA: '',
      dallaDataGraduatoria: '', allaDataGraduatoria: '',
      orderBy: this.filterFormSearch.value.orderBy, orderDirection: this.filterFormSearch.value.orderDirection
    });
  }
}
