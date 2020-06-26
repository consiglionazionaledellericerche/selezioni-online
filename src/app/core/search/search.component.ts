import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit} from '@angular/core';
import {CacheService} from '../cache.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { Profile } from '../../common/model/profile.enum.';


@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, AfterViewInit{
  
  cache: any = {};

  public filterFormSearch: FormGroup;
  public callCode: String;
  public profiles: Profile[] = Profile.values();

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private cacheService: CacheService) {
    this.route.queryParams.subscribe((queryParams) => {
      this.callCode = queryParams['callCode'];
    });            
  }

  ngAfterViewInit(): void {
    this.filterFormSearch.controls['filterType'].setValue('all');  
    this.filterFormSearch.controls['callCode'].setValue(this.callCode);  
  }

  ngOnInit(): void {
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
    });
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
  }

  isCurrentFilterType(filterType: string): boolean {
    return this.filterFormSearch.controls['filterType'].value === filterType;
  }
}
