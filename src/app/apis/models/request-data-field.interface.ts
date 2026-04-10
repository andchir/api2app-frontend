import {SafeResourceUrl} from "@angular/platform-browser";

export interface RequestDataField {
    name: string;
    value: string|number|boolean|string[]|File|File[]|SafeResourceUrl|null;
    hidden?: boolean;
    private?: boolean;
    isFile?: boolean;
    files?: File[];
}
