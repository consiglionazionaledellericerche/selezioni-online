import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[ad-metadata]',
})
export class AdMetadata {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
