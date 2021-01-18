import { ChangeDetectorRef, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Application } from "../core/application/application.model";
import { CacheService } from "../core/cache.service";
import { AdMetadataComponent } from "../shared/tags/show/ad-metadata.component";

export abstract class DynamicComponent implements AdMetadataComponent, OnInit{
    @Input() data: Application;
    @Input() form: FormGroup;
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngAfterViewChecked() {
      this.changeDetectorRef.detectChanges();
    }

    ngOnInit(): void {
    }

    public isLoaded(): boolean {
        return this.form !== undefined;
    }
  
}