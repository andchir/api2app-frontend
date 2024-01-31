import { AppBlock } from './app-block.interface';
import { User } from '../../apis/models/user.interface';

export interface AppErrors {
    [apiUuid: string]: {[name: string]: string}
}

export interface ApplicationItem {
    id: number;
    name: string;
    uuid: string;
    shared: boolean;
    hidden: boolean;
    gridColumns: number;
    language: string;
    blocks: AppBlock[];
    user?: User;
}
