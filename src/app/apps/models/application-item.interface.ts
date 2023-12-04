import { AppBlock } from './app-block.interface';

export interface ApplicationItem {
    id: number;
    name: string;
    uuid: string;
    shared: boolean;
    hidden: boolean;
    gridColumns: number;
    blocks: AppBlock[];
}
