import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Bootstrap Italia 2 does not declare @font-face rules in its SCSS: fonts are injected by its loader.
// Deep import keeps the rest of the Bootstrap Italia JS (and its data-api listeners) out of the bundle.
import loadFonts from 'bootstrap-italia/dist/plugins/fonts-loader.js';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Font files are copied from node_modules by the "assets" section of angular.json.
loadFonts('/assets/bootstrap-italia/fonts');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
