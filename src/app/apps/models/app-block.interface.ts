export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text'
    |'input-textarea'|'input-switch'|'input-select'|'input-radio'|'input-tags'|'input-number';

export interface AppOptions {
    [key: string]: string | number | boolean | string[];
}

export interface AppBlockElement {
    type: AppBlockElementType;
    name?: string;
    label?: string;
    placeholder?: string;
    value?: string | number | boolean | string[];
    choices?: string[];
    color?: string;
    min?: number;
    max?: number;
    options?: any;
}

export interface AppBlockOptions {
    gridColumnSpan: number;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
}