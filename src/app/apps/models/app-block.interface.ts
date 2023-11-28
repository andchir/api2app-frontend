export type AppBlockElementType = 'empty'|'text-header'|'text'|'button'|'input-text'|'input-textarea'|'input-switch'|'input-select'|'input-radio'|'input-tags';

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
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
}
