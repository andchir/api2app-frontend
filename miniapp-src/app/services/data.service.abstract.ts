import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, iif, Observable, throwError } from "rxjs";

export abstract class DataService<T extends {id: number}> {

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    httpOptionsFormData = {
        headers: new HttpHeaders({
            'enctype': 'multipart/form-data',
            'Accept': 'application/json'
        })
    };

    protected requestUrl = '';

    constructor(
        protected httpClient: HttpClient
    ) {}

    getList(page = 1, search?: string): Observable<{count: number, results: T[]}> {
        const url = this.requestUrl;
        const params = this.createParams({page, search});
        return this.httpClient.get<{count: number, results: T[]}>(url, Object.assign({}, this.httpOptions, {params}))
            .pipe(
                catchError(this.handleError)
            );
    }

    getListShared(page = 1, search?: string, language?: string): Observable<{count: number, results: T[]}> {
        const url = `${this.requestUrl}/list_shared`;
        const params = this.createParams({page, search, language});
        return this.httpClient.get<{count: number, results: T[]}>(url, Object.assign({}, this.httpOptions, {params}))
            .pipe(
                catchError(this.handleError)
            );
    }

    getItem(itemId: number): Observable<T> {
        const url = `${this.requestUrl}/${itemId}`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getItemByUuid(itemUuid: string): Observable<T> {
        const url = `${this.requestUrl}/${itemUuid}/by_uuid`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getItemByUuidShared(itemUuid: string): Observable<T> {
        // const url = `${this.requestUrl}/${itemUuid}/shared`;
        const url = `${this.requestUrl}${itemUuid}.json`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getItemByUuidEmbedded(itemUuid: string): Observable<T> {
        const url = `${this.requestUrl}/${itemUuid}/embedded`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteItem(itemId: number): Observable<any> {
        const url = `${this.requestUrl}/${itemId}`;
        return this.httpClient.delete<any>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    patch(itemId: number, data: any): Observable<T> {
        const url = `${this.requestUrl}/${itemId}`;
        return this.httpClient.patch<T>(url, data, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateItem(item: T|FormData, itemId?: number): Observable<T> {
        return iif(
            () => !!itemId,
            this.putItem(item, itemId),
            this.postItem(item)
        )
    }

    creteFormData(data: any, files?: {[key: string]: File}): FormData {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (Object.keys(files).includes(key)) {
                return;
            }
            if (typeof data[key] === 'object') {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, String(data[key]));
            }
        });
        Object.keys(files).forEach((key) => {
            if (!(files[key] instanceof File)) {
                return;
            }
            formData.append(key, files[key], files[key].name);
        });
        return formData;
    }

    postItem(item: T|FormData): Observable<T> {
        const url = this.requestUrl;
        const httpOptions = item instanceof FormData ? this.httpOptionsFormData : this.httpOptions;
        return this.httpClient.post<T>(url, item, httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    putItem(item: T|FormData, itemId: number = 0): Observable<T> {
        const url = `${this.requestUrl}/${itemId}`;
        const httpOptions = item instanceof FormData ? this.httpOptionsFormData : this.httpOptions;
        return this.httpClient.put<T>(url, item, httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    downloadItem(uuid: string): Observable<{success: boolean, file_name?: string}> {
        const url = `${this.requestUrl}/${uuid}/download`
        return this.httpClient.post<{success: boolean, file_name?: string}>(url, {}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    createParams(options: any): HttpParams {
        let params = new HttpParams();
        for (const name in options) {
            if (!options.hasOwnProperty(name)
                || typeof options[name] === 'undefined') {
                continue;
            }
            params = params.append(name, options[name] !== null ? options[name] : '');
        }
        return params;
    }

    getCookie(name: string|null): string {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    handleError<T>(error: HttpErrorResponse): Observable<any> {
        if (error.error) {
            return throwError(error.error);
        }
        if (error.message) {
            return throwError(() => error.message);
        }
        return throwError(() => error);
    }
}
