export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text' |'input-textarea'|'input-switch'
    |'input-select'|'input-radio'|'input-tags'|'input-number'|'input-date'|'image'|'audio'|'chart-line';

export interface AppOptions {
    [key: string]: string | number | boolean | string[];
}

export interface AppBlockElementOptions {
    apiUuid?: string;
    fieldName?: string;
    fieldType?: string;
}

export interface AppBlockElement {
    type: AppBlockElementType;
    name?: string;
    label?: string;
    placeholder?: string;
    value?: string | number | boolean | string[];
    valueObj?: any;
    orderIndex?: number;
    choices?: string[];
    color?: string;
    min?: number;
    max?: number;
    prefixText?: string;
    suffixText?: string;
    options?: AppBlockElementOptions;
}

export interface AppBlockOptions {
    gridColumnSpan: number;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
}
