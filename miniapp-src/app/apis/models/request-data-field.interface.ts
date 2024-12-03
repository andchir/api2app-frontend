export interface RequestDataField {
    name: string;
    value: string|string[]|number|boolean|File|File[]|null;
    hidden?: boolean;
    private?: boolean;
    isFile?: boolean;
    files?: File[];
}
