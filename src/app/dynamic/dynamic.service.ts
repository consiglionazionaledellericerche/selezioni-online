import { Injectable, Type, NgModule, Component, ComponentFactoryResolver, ComponentFactory } from "@angular/core";
import { CmisObject } from "../common/model/cmisobject.model";
import { AdMetadataComponent } from "../shared/tags/show/ad-metadata.component";
import { DynamicModule } from "./dynamic.module";
import { AdMetadata } from "../shared/tags/show/ad-metadata.directive";
import { JcononAttachmentShowComponent } from "./attachment/jconon-attachment-show.component";

@Injectable({
    providedIn: 'root',
})
export class DynamicService {
    private components: Map<string, ComponentFactory<any>>;
    
    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        this.components = new Map();
    }

    public loadComponent(selector: string, adMetadata: AdMetadata, cmisObject: CmisObject) {
        if (!this.components.has(selector)) {
            console.info("Try to find component with selector: ", selector);
            const ngModuleAnnotation = decoratorOfType(DynamicModule, NgModule);
            const componentType = ngModuleAnnotation.declarations.find((declaration: Type<any>) => {
                // get the @Component decorator
                const declarationAnnotation = decoratorOfType(declaration, Component);
          
                // find a declaration with the @Component decorator (not a @Directive) with the requested selector
                return declarationAnnotation != null && declarationAnnotation.selector === selector;
            });
            console.info("Find component with type: ", componentType);
            if (componentType) {
                this.components.set(selector, this.componentFactoryResolver.resolveComponentFactory(componentType as Type<any>));
            } else {
                this.components.set(selector, this.componentFactoryResolver.resolveComponentFactory(JcononAttachmentShowComponent));   
            }
        }
        const viewContainerRef = adMetadata.viewContainerRef;
        viewContainerRef.clear();
    
        const componentRef = viewContainerRef.createComponent(this.components.get(selector));
        (<AdMetadataComponent>componentRef.instance).data = cmisObject;
    }

}
export function decoratorOfType<T>(decoratedType: Type<any>, decoratorType: Type<T>): T {
    // get all decorators off of the provided type
	return Reflect.getOwnPropertyDescriptor(decoratedType, '__annotations__').value.find((annotation: any) =>
        // get the decorator that matches the requested type
		annotation instanceof decoratorType
	);
}
