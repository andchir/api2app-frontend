import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, iif, Observable, throwError } from "rxjs";

export abstract class DataService<T extends {id: number}> {

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    protected requestUrl = '';

    constructor(
        protected httpClient: HttpClient
    ) {}

    getList(): Observable<{count: number, results: T[]}> {
        const url = `${this.requestUrl}/`;
        return this.httpClient.get<{count: number, results: T[]}>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getListShared(): Observable<{count: number, results: T[]}> {
        const url = `${this.requestUrl}/list_shared/`;
        return this.httpClient.get<{count: number, results: T[]}>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getItem(itemId: number): Observable<T> {
        const url = `${this.requestUrl}/${itemId}/`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    getItemByUuid(itemUuid: string): Observable<T> {
        const url = `${this.requestUrl}/${itemUuid}/shared/`;
        return this.httpClient.get<T>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteItem(itemId: number): Observable<any> {
        const url = `${this.requestUrl}/${itemId}/`;
        return this.httpClient.delete<any>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    patch(itemId: number, data: any): Observable<T> {
        const url = `${this.requestUrl}/${itemId}/`;
        return this.httpClient.patch<T>(url, data, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateItem(item: T): Observable<T> {
        return iif(
            () => !!item.id,
            this.putItem(item),
            this.postItem(item)
        )
    }

    postItem(item: T): Observable<T> {
        const url = `${this.requestUrl}/`;
        return this.httpClient.post<T>(url, item, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    putItem(item: T): Observable<T> {
        const url = `${this.requestUrl}/${item.id}/`;
        return this.httpClient.put<T>(url, item, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
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
