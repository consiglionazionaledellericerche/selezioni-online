import {Component, OnInit} from '@angular/core';
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
  public filterType: String = 'active';

  constructor(
    private formBuilder: FormBuilder,
    private cacheService: CacheService) {
  }

  ngOnInit(): void {
    this.filterFormHome = this.formBuilder.group({
      callCode: new FormControl(this.callCode),
      filterType: new FormControl(this.filterType),
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

  setType(type: string): void {
    this.filterFormHome.controls['type'].setValue(type);
  }

  getType(): string {
    return this.filterFormHome.controls['type'].value;
  }

  isCurrentType(type: string): boolean {
    return this.filterFormHome.controls['type'].value === type;
  }

  isCurrentFilterType(filterType: string): boolean {
    return this.filterFormHome.controls['filterType'].value === filterType;
  }

}
