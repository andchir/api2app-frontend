export type AppBlockElementType = 'empty'|'select-type'|'text-header'|'text'|'button'|'input-text'|'input-textarea'|'input-switch'|'input-select'|'input-radio';

export interface AppOptions {
    [key: string]: string | number | boolean;
}

export interface AppBlockElementOption {
    name: string;
    label: string;
    type: AppBlockElementType;
    value?: string | number | boolean;
    choices?: string[];
}

export interface AppBlockElement {
    id: number;
    type: AppBlockElementType;
    options?: AppOptions;
    fields?: AppBlockElementOption[];
}

export interface AppBlock {
    id: number;
    elements: AppBlockElement[];
    options?: AppOptions;
}
