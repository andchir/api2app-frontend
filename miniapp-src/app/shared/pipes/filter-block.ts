import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterBlock'
})
export class FilterBlockPipe implements PipeTransform {
    transform(items: any[], field : string, tabIndex : number): any[] {
        if (!items) return [];
        return items.filter(it => it[field] === -1 || it[field] === tabIndex);
    }
}
