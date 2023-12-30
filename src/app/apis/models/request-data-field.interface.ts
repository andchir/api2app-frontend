export interface RequestDataField {
    name: string;
    value: string;
    hidden?: boolean;
    private?: boolean;
    isFile?: boolean;
    files?: File[];
}
