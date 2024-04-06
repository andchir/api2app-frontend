export interface RequestDataField {
    name: string;
    value: string|string[]|number|boolean|File[]|null;
    hidden?: boolean;
    private?: boolean;
    isFile?: boolean;
    files?: File[];
}
