import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// I font di Bootstrap Italia vengono caricati da design-angular-kit (provideDesignAngularKit in AppModule).
platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
