export type AppBlockElementType = 'empty'|'select-type'|'text-header'|'text'|'button'|'input-text'|'input-textarea'|'input-switch'|'input-select'|'input-radio';

export interface AppBlockElementOption {
    name: string;
    title: string;
    type: AppBlockElementType;
    value?: string | number;
    choices?: string[];
}

export interface AppBlockElement {
    id: number;
    type: AppBlockElementType;
    options?: {[key: string]: string | number};
    fields?: AppBlockElementOption[];
}

export interface AppBlock {
    id: number;
    elements: AppBlockElement[];
    options?: {[key: string]: string | number};
}
