import { CustomTableField } from './custom-table-field.interface';

export interface CustomTable {
    id: number;
    date_created: string;
    date_updated: string;
    title: string;
    name?: string;
    db_table_name?: string;
    access_key?: string;
    description?: string;
    fields_count?: number;
    fields?: CustomTableField[];
}

export interface CustomTableListResponse {
    count: number;
    results: CustomTable[];
}
