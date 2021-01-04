import { FormGroup } from "@angular/forms";
import { CmisObject } from "../../../common/model/cmisobject.model";

export interface AdMetadataComponent {
    data: CmisObject;
    form: FormGroup;
}