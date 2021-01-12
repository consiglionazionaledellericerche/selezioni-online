import {Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CacheService} from '../cache.service';
import {FormGroup, FormBuilder, FormControl} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  
  cache: any = {};
  public filterFormHome: FormGroup;
  public callCode: String;
  @ViewChild('callList', {static: false}) callList: ElementRef;
  
  constructor(
    private formBuilder: FormBuilder,
    private cacheService: CacheService) {}

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
    });
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
  }

}
