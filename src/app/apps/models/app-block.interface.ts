import { SafeResourceUrl } from '@angular/platform-browser';

export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text' |'input-textarea'|'input-switch'
    |'input-select'|'input-radio'|'input-tags'|'input-number'|'input-hidden'|'input-date'|'input-file'|'image'
    |'audio'|'video'|'input-chart-line'|'input-slider'|'input-color'|'input-pagination'|'status'|'table';

export interface AppOptions {
    [key: string]: string | number | boolean | string[] | SafeResourceUrl | File[];
}

export interface AppBlockElementOptions {
    inputApiUuid?: string;
    inputApiFieldName?: string|number;
    inputApiFieldType?: string;
    outputApiUuid?: string;
    outputApiFieldName?: string|number;
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
    selectDefaultFirst?: boolean;
    useDefault?: boolean;
    perPage?: number,
    statusCompleted?: string;
    statusError?: string;
    itemFieldNameForTitle?: string;
    itemFieldNameForValue?: string;
    options?: AppBlockElementOptions;
    value?: string | number | boolean | string[] | File[] | SafeResourceUrl | null;
    valueArr?: string[] | {label: string, value: string}[] | File[] | null;
    valueObj?: any | null;
    markdown?: boolean;
    icon?: string;
    useAsOffset?: boolean;
    isHTML?: boolean;
    itemFieldName?: string;
}

export interface AppBlockOptions {
    gridColumnSpan?: number;
    orderIndex?: number;
    autoClear?: boolean;
    messageSuccess?: string;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: AppBlockOptions;
    loading?: boolean;
}
