import { AppBlock } from './app-block.interface';

export interface ApplicationItem {
    id: number;
    name: string;
    uuid: string;
    shared: boolean;
    gridColumns: number;
    blocks: AppBlock[];
}
