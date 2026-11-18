import { AuthorityPickerComponent } from '../shared/ui/authority-picker.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateCompiler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { TagsModule } from '../shared/tags/tags.module';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';
import { ConfigService } from '../core/config.service';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { AdminSectionComponent } from './admin-section.component';
import { GroupsComponent } from './groups/groups.component';
import { UsersComponent } from './users/users.component';
import { RbacComponent } from './rbac/rbac.component';
import { CacheComponent } from './cache/cache.component';
import { ViewsComponent } from './views/views.component';
import { JsConsoleComponent } from './js-console/js-console.component';

/**
 * Modulo di amministrazione, caricato solo quando serve (route /admin).
 * Sostituisce le pagine legacy groups, gestori, gestione-utenti, rbac-admin, editView e jsConsole.
 */
@NgModule({
  declarations: [
    AdminSectionComponent,
    GroupsComponent,
    UsersComponent,
    RbacComponent,
    CacheComponent,
    ViewsComponent,
    JsConsoleComponent
  ],
  imports: [
    AuthorityPickerComponent,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TagsModule,
    AdminRoutingModule,
    TranslateModule
  ],
  providers: [
    AdminService,
    AdminGuard
  ]
})
export class AdminModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}
