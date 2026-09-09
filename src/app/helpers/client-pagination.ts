import { PaginationInstance } from 'ngx-pagination';
import { AppBlock, AppBlockElement } from '../apps/models/app-block.interface';

export function isClientPagination(element: AppBlockElement): boolean {
    return element?.type === 'input-pagination' && !element.options?.inputApiUuid?.trim();
}

export function getPaginationTarget(pagination: AppBlockElement, block?: AppBlock): AppBlockElement | undefined {
    const supportsPagination = (element: AppBlockElement) =>
        element.type === 'table' || (element.type === 'text' && Array.isArray(element.valueArr));
    const outputApiUuid = pagination.options?.outputApiUuid?.trim();
    if (!outputApiUuid) {
        return undefined;
    }
    return block?.elements.find(element => element.options?.inputApiUuid?.trim() === outputApiUuid && supportsPagination(element));
}

export function getClientPagination(pagination: AppBlockElement, target?: AppBlockElement): PaginationInstance {
    const perPage = Number(pagination.perPage);
    const itemsPerPage = Number.isFinite(perPage) ? Math.max(1, Math.floor(perPage)) : 20;
    const totalItems = target?.valueArr?.length || 0;
    const value = Number(pagination.value);
    const requestedPage = pagination.useAsOffset ? Math.floor(value / itemsPerPage) + 1 : Math.floor(value);
    const lastPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.min(lastPage, requestedPage)) : 1;
    return { id: pagination.name, itemsPerPage, totalItems, currentPage };
}
