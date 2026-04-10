import {SafeResourceUrl} from "@angular/platform-browser";

export interface RequestDataField {
    name: string;
    value: string|any[]|number|boolean|File|File[]|null;
    hidden?: boolean;
    private?: boolean;
    isFile?: boolean;
    files?: File[];
}
