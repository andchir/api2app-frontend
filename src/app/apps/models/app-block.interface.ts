export type AppBlockElementType = 'empty'|'select-type'|'text-header'|'text'|'button'|'input-text'|'input-textarea'|'input-switch'|'input-select'|'input-radio';

export interface AppOptions {
    [key: string]: string | number | boolean;
}

export interface AppBlockElementOptions {
    name: string;
    label: string;
    type: AppBlockElementType;
    value?: string | number | boolean;
    choices?: string[];
}

export interface AppBlockElement {
    type: AppBlockElementType;
    fields?: AppBlockElementOptions[];
    options?: any;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: any;
}
