import { TranslateCompiler } from "@ngx-translate/core";

export class CustomTranslationCompiler extends TranslateCompiler {
    /*
    * Needed by ngx-translate
    */
    public compile(value: string, lang: string): string {
        return value;
    }

    /*
    * Triggered once from TranslateCompiler
    * Initiates recurive this.parseReferencePointers()
    * Returns modified translations object for ngx-translate to process
    */
    public compileTranslations(translations: any, lang: string) {
        this.parseReferencePointers(translations, translations);
        return translations;
    }

    /*
    * Triggered once from this.compileTranslations()
    * Recursively loops through an object,
    * replacing any property value that has a string starting with "@:" with the APP_CORE global string definition.
    * i.e. @: becomes Location Overview
    */
    private parseReferencePointers(currentTranslations, masterLanguageFile) {
        Object.keys(currentTranslations).forEach((key) => {
            if (currentTranslations[key] !== null && typeof currentTranslations[key] === 'object') {
                this.parseReferencePointers(currentTranslations[key], masterLanguageFile);
                return;
            }
            if (typeof currentTranslations[key] === 'string') {
                if (currentTranslations[key].includes("@:")) {
                    let replacementProperty = this.getDescendantPropertyValue(masterLanguageFile, currentTranslations[key].substring(2));
                    currentTranslations[key] = replacementProperty;
                }
            }
        });
    }

    /*
    * Takes a string representation of an objects dot notation
    * i.e. "APP_CORE.LABEL.LOCATION"
    * and returns the property value of the input objects property
    */
    private getDescendantPropertyValue(obj, desc) {
        var arr = desc.split(".");
        while(arr.length && (obj = obj[arr.shift()]));
        return obj;
    }

}
