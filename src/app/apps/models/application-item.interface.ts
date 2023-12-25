import { AppBlock } from './app-block.interface';
import { User } from '../../apis/models/user.interface';

export interface ApplicationItem {
    id: number;
    name: string;
    uuid: string;
    shared: boolean;
    hidden: boolean;
    gridColumns: number;
    blocks: AppBlock[];
    user?: User;
}
