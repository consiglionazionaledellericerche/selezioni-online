import {Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Location, PopStateEvent} from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];


  constructor(private router: Router,
              private location: Location,
              protected httpClient: HttpClient,
              public translate: TranslateService) {
    translate.addLangs(['it', 'en']);
    translate.getLangs().forEach((lang: string) => {
      translate.reloadLang(lang).subscribe((res) => {
        httpClient.get('assets/i18n/custom_' + lang + '.json').subscribe((data) => {
          if (data) {
            translate.setTranslation(lang, data, true);
          }
        });
      });
    });
  }

  ngOnInit() {

    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url;
    });

    this.router.events.subscribe((ev: any) => {
      if (ev instanceof NavigationStart) {
        if (ev.url !== this.lastPoppedUrl) {
          this.yScrollStack.push(window.scrollY);
        }
      } else if (ev instanceof NavigationEnd) {
        if (ev.url === this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop());
        } else {
          window.scrollTo(0, 0);
        }
      }
    });

  }

}
