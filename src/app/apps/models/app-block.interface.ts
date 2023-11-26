export interface AppBlockElement {
    id: number;
    type: 'empty'|'select-type'|'input-text'|'button';
}

export interface AppBlock {
    id: number;
    elements: AppBlockElement[];
}
