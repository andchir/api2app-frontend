export interface CustomTableField {
    id?: number;
    table?: number;
    name: string;
    column_name: string;
    field_type: 'string'|'text'|'integer'|'float'|'boolean'|'date'|'datetime'|'json'|'file'|string;
    required: boolean;
    default_value: any;
    max_length: number|null;
    order_index: number;
}
