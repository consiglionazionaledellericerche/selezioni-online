import {Component, OnInit, ChangeDetectionStrategy, OnDestroy, Output} from '@angular/core';
import {CacheService} from '../cache.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { Profile } from '../../common/model/profile.enum.';

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy{
  
  cache: any = {};

  public filterFormSearch: FormGroup;
  public callCode: String;
  public profiles: Profile[] = Profile.values();

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              protected router: Router,
              private cacheService: CacheService) {
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
    });
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
  }

  isCurrentFilterType(filterType: string): boolean {
    return this.filterFormSearch.controls['filterType'].value === filterType;
  }

    // -------------------------------
  // On Destroy.
  // -------------------------------

  public ngOnDestroy() {
  }

}
