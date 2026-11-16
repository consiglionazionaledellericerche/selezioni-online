import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[ad-metadata]',
})
export class AdMetadata {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
