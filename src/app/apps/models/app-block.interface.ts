import { SafeResourceUrl } from '@angular/platform-browser';

export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text' |'input-textarea'|'input-switch'
    |'input-select'|'input-radio'|'input-tags'|'input-number'|'input-hidden'|'input-date'|'input-file'|'image'
    |'audio'|'chart-line';

export interface AppOptions {
    [key: string]: string | number | boolean | string[] | SafeResourceUrl | File[];
}

export interface AppBlockElementOptions {
    inputApiUuid?: string;
    inputApiFieldName?: string;
    inputApiFieldType?: string;
    outputApiUuid?: string;
    outputApiFieldName?: string;
    outputApiFieldType?: string;
}

export interface AppBlockElement {
    type: AppBlockElementType;
    name?: string;
    label?: string;
    placeholder?: string;
    orderIndex?: number;
    choices?: string[];
    color?: string;
    min?: number;
    max?: number;
    prefixText?: string;
    suffixText?: string;
    format?: string;
    enabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    multiple?: boolean;
    fieldNameAxisX?: string;
    fieldNameAxisY?: string;
    isXAxisDate?: boolean;
    itemFieldNameForValue?: string;
    options?: AppBlockElementOptions;
    value?: string | number | boolean | string[] | File[] | SafeResourceUrl | null;
    valueArr?: string[] | File[] | null;
    valueObj?: any | null;
}

export interface AppBlockOptions {
    gridColumnSpan: number;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
    loading?: boolean;
    orderIndex?: number;
}
