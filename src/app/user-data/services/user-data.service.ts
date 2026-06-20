import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';

import { catchError, map, Observable } from 'rxjs';

import { BASE_URL } from '../../../environments/environment';
import { DataService } from '../../services/data.service.abstract';
import { CustomTable, CustomTableListResponse } from '../models/custom-table.interface';
import { CustomTableField } from '../models/custom-table-field.interface';

type CustomTableListApiResponse = CustomTable[] | {
    count?: number;
    results?: CustomTable[];
};

@Injectable()
export class UserDataService extends DataService<CustomTable> {

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/custom_tables`;
    }

    override getList(page = 1, search?: string): Observable<CustomTableListResponse> {
        const params = this.createParams({page, page_size: 16, search});
        return this.httpClient.get<CustomTableListApiResponse>(this.requestUrl, Object.assign({}, this.httpOptions, {params}))
            .pipe(
                map((res) => {
                    if (Array.isArray(res)) {
                        return {
                            count: res.length,
                            results: res
                        };
                    }
                    return {
                        count: res.count || 0,
                        results: res.results || []
                    };
                }),
                catchError(this.handleError)
            );
    }

    addField(tableId: number, field: CustomTableField): Observable<CustomTableField> {
        const url = `${this.requestUrl}/${tableId}/fields`;
        return this.httpClient.post<CustomTableField>(url, field, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteField(tableId: number, fieldId: number): Observable<void> {
        const url = `${this.requestUrl}/${tableId}/fields/${fieldId}`;
        return this.httpClient.delete<void>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    createApiItem(tableId: number): Observable<unknown> {
        const url = `${this.requestUrl}/${tableId}/create_api_item`;
        return this.httpClient.post<unknown>(url, {}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }
}
