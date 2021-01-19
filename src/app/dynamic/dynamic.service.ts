import { Injectable, ComponentFactoryResolver, ComponentFactory } from "@angular/core";
import { CmisObject } from "../common/model/cmisobject.model";
import { AdMetadataComponent } from "../shared/tags/show/ad-metadata.component";
import { AdMetadata } from "../shared/tags/show/ad-metadata.directive";
import { ObjectType } from "../common/model/object-type.model";
import { FormGroup } from "@angular/forms";

@Injectable({
    providedIn: 'root',
})
export class DynamicService {
    private components: Map<string, ComponentFactory<any>>;
    
    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        this.components = new Map();
    }

    public loadComponent(selector: string, adMetadata: AdMetadata, cmisObject: CmisObject, form: FormGroup) {
        if (!this.components.has(selector)) {
            console.info("Try to find component with selector: ", selector);
            this.components.set(selector, this.componentFactoryResolver.resolveComponentFactory(ObjectType.getComponent(selector)));
        }
        const viewContainerRef = adMetadata.viewContainerRef;
        viewContainerRef.clear();
    
        const componentRef = viewContainerRef.createComponent(this.components.get(selector));
        (<AdMetadataComponent>componentRef.instance).data = cmisObject;
        if (form) {
            (<AdMetadataComponent>componentRef.instance).form = form;
        }
        let params = ObjectType.getParams(selector);
        if (params) {
            Object.keys(params).forEach(key => {
                (<AdMetadataComponent>componentRef.instance)[key] = params[key];
            });
        }
    }
}
