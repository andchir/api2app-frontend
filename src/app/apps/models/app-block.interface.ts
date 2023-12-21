export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text' |'input-textarea'|'input-switch'
    |'input-select'|'input-radio'|'input-tags'|'input-number'|'input-date'|'input-file'|'image'|'audio'|'chart-line';

export interface AppOptions {
    [key: string]: string | number | boolean | string[] | File[];
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
    orderIndex?: number;
    choices?: string[];
    color?: string;
    min?: number;
    max?: number;
    prefixText?: string;
    suffixText?: string;
    format?: string;
    enabled?: boolean;
    multiple?: boolean;
    fieldNameAxisX?: string;
    fieldNameAxisY?: string;
    isYAxisDate?: boolean;
    options?: AppBlockElementOptions;
    value?: string | number | boolean | string[] | File[] | null;
    valueArr?: string[] | File[] | null;
    valueObj?: any | null;
}

export interface AppBlockOptions {
    gridColumnSpan: number;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
}
