import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '../shared.module';

import {ShowTextComponent} from './show/show-text.component';
import {ShowTextModalComponent} from './show/show-text-modal.component';
import {ShowChildrenModalComponent} from './show/show-children-modal.component';
import {LayoutTitleComponent} from './layout/layout-title.component';
import {RouterModule} from '@angular/router';
import {ShowLayoutComponent} from './show/show-layout.component';
import {ShowMetadataComponent} from './show/show-metadata.component';
import {ShowAffixComponent} from './show/show-affix.component';

import {EditMetdataComponent} from './wizard/edit-metadata.component';

import {AdMetadata} from './show/ad-metadata.directive';

import {ListLayoutComponent} from './list/list-layout.component';
import {GridLayoutComponent} from './list/grid-layout.component';

import {FormLayoutComponent} from './forms/form-layout.component';
import {FormTemplateTextComponent} from './forms/form-template-text.component';
import {FormTemplateToggleComponent} from './forms/form-template-toggle.component';
import {FormTemplateTextAreaComponent} from './forms/form-template-textarea.component';
import {FormTemplateDatepickerComponent} from './forms/form-template-datepicker.component';
import {ButtonNewComponent} from './buttons/button-new.component';
import {ButtonCsvComponent} from './buttons/button-csv.component';
import {ButtonSaveComponent} from './buttons/button-save.component';
import {ButtonCancelComponent} from './buttons/button-cancel.component';
import {ButtonBackComponent} from './buttons/button-back.component';
import {ButtonsLayoutComponent} from './buttons/buttons-layout.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlertModule} from 'ngx-bootstrap/alert';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {CollapseModule} from 'ngx-bootstrap/collapse';
import {BsModalService, ModalModule} from 'ngx-bootstrap/modal';

import {PaginationModule} from 'ngx-bootstrap/pagination';
import {PopoverModule, PopoverDirective} from 'ngx-bootstrap/popover';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {ButtonsModule} from 'ngx-bootstrap/buttons';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {ListItemCallComponent} from './list/list-item-call.component';
import {ListItemApplicationComponent} from './list/list-item-application.component';
import {ListItemDocumentComponent} from './list/list-item-document.component';
import {ButtonCrudComponent} from './buttons/button-crud.component';
import {ButtonDeleteComponent} from './buttons/button-delete.component';
import {ButtonConfirmComponent} from './buttons/button-confirm.component';
import {ListHeaderLayoutComponent} from './list/list-header-layout.component';
import {EditHeaderLayoutComponent} from './layout/layout-edit-header.component';
import {FormTemplateCheckboxComponent} from './forms/form-template-checkbox.component';
import {ShowEnumComponent} from './show/show-enum.component';
import {FormTemplateSelectModelComponent} from './forms/form-template-select-model.component';
import {FormTemplateButtonEventComponent} from './forms/form-template-button-event.component';
import {ListPaginationComponent} from './list/list-pagination.component';
import {TableItemComponent} from './table/table-item.component';
import {WizardComponent} from './wizard/wizard.component';
import {WizardItemComponent} from './wizard/wizard-item.component';
import {WizardItemContentComponent} from './wizard/wizard-item-content.component';
import {FormValidationErrorLayoutComponent} from './forms/form-validation-error-layout.component';
import {ShowMultiComponent} from './show/show-multi.component';
import {LayoutBreadcrumbsComponent} from './layout/layout-breadcrumbs.component';
import {LayoutLegendComponent} from './layout/layout-legend.component';
import {LayoutWaitComponent} from './layout/layout-wait.component';
import {AttachmentComponent} from './attachments/attachment.component';
import {AttachmentListComponent} from './attachments/attachment-list.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {FormTemplateColorPickerComponent} from './forms/form-template-colorpicker.component';
import {ShowColorComponent} from './show/show-color.component';
import {ShowBooleanComponent} from './show/show-boolean.component';

import {ChildrenListComponent} from '../../core/children/children-list.component';
import {ChildrenService} from '../../core/children//children.service';

// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import { CustomTranslationCompiler } from '../../common/helpers/translation-compiler';

@NgModule({
  declarations: [
    // Layout
    LayoutTitleComponent,
    LayoutBreadcrumbsComponent,
    LayoutLegendComponent,
    LayoutWaitComponent,
    
    // Form
    FormLayoutComponent,
    FormValidationErrorLayoutComponent,

    FormTemplateTextComponent,
    FormTemplateToggleComponent,
    FormTemplateTextAreaComponent,
    FormTemplateCheckboxComponent,
    FormTemplateDatepickerComponent,
    FormTemplateSelectModelComponent,
    FormTemplateButtonEventComponent,
    FormTemplateColorPickerComponent,

    // Buttons
    ButtonsLayoutComponent,

    ButtonNewComponent,
    ButtonCsvComponent,
    ButtonSaveComponent,
    ButtonCancelComponent,
    ButtonBackComponent,
    ButtonCrudComponent,
    ButtonDeleteComponent,
    ButtonConfirmComponent,

    // Show
    AdMetadata,
    ShowLayoutComponent,
    ShowMetadataComponent,
    ShowAffixComponent,
    ShowEnumComponent,
    ShowTextComponent,
    ShowTextModalComponent,
    ShowChildrenModalComponent,
    ShowMultiComponent,
    ShowColorComponent,
    ShowBooleanComponent,

    // List
    ListLayoutComponent,
    GridLayoutComponent,
    ListHeaderLayoutComponent,
    ListItemCallComponent,
    ListItemApplicationComponent,
    ListItemDocumentComponent,
    ListPaginationComponent,
    TableItemComponent,
    ChildrenListComponent,

    // Edit
    EditHeaderLayoutComponent,
    EditMetdataComponent,

    // Wizard
    WizardComponent,
    WizardItemComponent,
    WizardItemContentComponent,

    // Attachement
    AttachmentComponent,
    AttachmentListComponent,

  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ButtonsModule.forRoot(),
    PopoverModule.forRoot(),
    ColorPickerModule,
    TranslateModule.forChild({
      compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
      loader: {
          provide: TranslateLoader,
          useFactory: CustomHttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
  ],
  exports: [
    BsDatepickerModule,
    BsDropdownModule,
    ModalModule,
    CollapseModule,
    AlertModule,
    PaginationModule,
    TooltipModule,
    PopoverModule,
    ColorPickerModule,

    // Layout
    LayoutTitleComponent,
    LayoutBreadcrumbsComponent,
    LayoutLegendComponent,
    LayoutWaitComponent,

    // Form
    FormTemplateTextComponent,
    FormTemplateToggleComponent,
    FormTemplateTextAreaComponent,
    FormTemplateCheckboxComponent,
    FormTemplateDatepickerComponent,
    FormTemplateSelectModelComponent,
    FormTemplateButtonEventComponent,
    FormValidationErrorLayoutComponent,
    FormTemplateColorPickerComponent,

    // Buttons
    ButtonsLayoutComponent,

    ButtonNewComponent,
    ButtonCsvComponent,
    ButtonSaveComponent,
    ButtonCancelComponent,
    ButtonBackComponent,
    ButtonCrudComponent,
    ButtonDeleteComponent,
    ButtonConfirmComponent,

    // Show
    ShowEnumComponent,
    ShowTextComponent,
    ShowTextModalComponent,
    ShowChildrenModalComponent,
    ShowMetadataComponent,
    ShowAffixComponent,
    ShowMultiComponent,
    ShowColorComponent,
    ShowBooleanComponent,
    AdMetadata,

    // List
    ListLayoutComponent,
    GridLayoutComponent,
    ListHeaderLayoutComponent,
    ListItemCallComponent,
    ListItemApplicationComponent,
    ListItemDocumentComponent,
    ListPaginationComponent,
    TableItemComponent,
    ChildrenListComponent,

    // Edit
    EditHeaderLayoutComponent,
    EditMetdataComponent,

    // Wizard
    WizardComponent,
    WizardItemComponent,
    WizardItemContentComponent,

    // Attachment
    AttachmentComponent,
    AttachmentListComponent,


  ],
  providers: [
    BsModalService,
    PopoverDirective,
    ChildrenService
  //   I18n
  //   // {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n},
  //   // {provide: NgbDateParserFormatter, useClass: NgbDateItParserFormatter}
   ],
  entryComponents: [
    ShowMetadataComponent,
    ShowAffixComponent,

  ]
})
export class TagsModule {}


// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}