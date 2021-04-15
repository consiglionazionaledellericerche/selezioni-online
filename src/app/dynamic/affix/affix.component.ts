import { ChangeDetectorRef } from "@angular/core";
import { CacheService } from "../../core/cache.service";
import { Application } from "../../core/application/application.model";
import { DynamicComponent } from "../dynamic.component";

export abstract class AffixComponent extends DynamicComponent<Application>{
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
        super(cacheService, changeDetectorRef);
    }

    private controlExcluded = [
        'jconon_application:nome',
        'jconon_application:cognome',
        'jconon_application:user',
        'cmis:objectTypeId',
        'cmis:objectId',
        'jconon_application:last_section_completed',
        'aspect'
    ];
    ngOnInit(): void {
        Object.keys(this.form.controls).forEach(control => {
            if (this.controlExcluded.indexOf(control) == -1) {
                this.form.removeControl(control);
            }
        });
        super.ngOnInit();
    }
}
