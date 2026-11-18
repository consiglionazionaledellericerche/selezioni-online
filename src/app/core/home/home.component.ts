import { ObjectType } from '../../common/model/object-type.model';
import { TranslateService } from '@ngx-translate/core';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CacheService } from '../cache.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [`
    .filters { margin-top: 1.6rem; }
    .filters-title { font-size: .875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    .type-list a { display: block; padding: .35rem .5rem; border-radius: 4px; text-decoration: none; color: #17324d; font-size: .95rem; }
    .type-list a:hover { background: #f0f6fc; }
    .type-list a.active { background: #0066cc; color: #fff; font-weight: 600; }
    .type-group { display: block; padding: .5rem .5rem .25rem; font-size: .8rem; font-weight: 700; color: #5d7083; text-transform: uppercase; }
  `]
})
export class HomeComponent implements OnInit {

  public states = [
    { value: 'active', label: 'layout.state_open' },
    { value: 'expire', label: 'layout.state_closed' },
    { value: 'all', label: 'layout.state_all' }
  ];

  /** Etichetta della tipologia: traduzione locale, altrimenti l'etichetta inviata dal backend. */
  public typeLabel(item: any): string {
    const translated = this.translateService.instant(item.key);
    if (translated && translated !== item.key) {
      return translated;
    }
    const label = item.label || item.defaultLabel;
    return label && label !== item.key ? label : ObjectType.readable(item.key);
  }

  public sortOptions = [
    { value: 'scadenza', label: 'layout.sort.deadline' },
    { value: 'inizio', label: 'layout.sort.start' },
    { value: 'gazzetta', label: 'layout.sort.gazette' },
    { value: 'codice', label: 'layout.sort.code' },
    { value: 'creazione', label: 'layout.sort.created' }
  ];

  public setState(value: string): void {
    this.filterFormHome.controls['filterType'].setValue(value);
  }

  public setType(value: string): void {
    this.filterFormHome.controls['type'].setValue(value);
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      document.getElementById('home_code')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  
  cache: any = {};
  public filterFormHome: FormGroup;
  public callCode: String;
  @ViewChild('callList') callList: ElementRef;
  
  constructor(
    private formBuilder: FormBuilder,
    private cacheService: CacheService,
    private translateService: TranslateService) {}


  ngOnInit(): void {
    this.filterFormHome = this.formBuilder.group({
      callCode: new FormControl(this.callCode),
      filterType: new FormControl('active'),
      type: new FormControl('jconon_call:folder'),
      inizioScadenza: '',
      fineScadenza: '',
      profile: new FormControl(''),
      gazzetteNumber: new FormControl(''),
      gazzetteDate: new FormControl(''),
      requirements: new FormControl(''),
      struttura: new FormControl(''),
      sede: new FormControl(''),
      orderBy: new FormControl('scadenza'),
      orderDirection: new FormControl('desc'),
    });
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
  }

}
