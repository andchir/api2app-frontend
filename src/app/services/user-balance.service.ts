import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';

import { DataService } from './data.service.abstract';
import { BASE_URL } from '../../environments/environment';

@Injectable()
export class UserBalanceService {

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected httpClient: HttpClient
    ) {
        this.httpOptions.headers = this.addCsrfToken(this.httpOptions.headers);
    }

    addCsrfToken(headers: HttpHeaders): HttpHeaders {
        const csrfToken = window['csrf_token'] || DataService.getCookie('csrftoken') || '';
        headers = headers.append('X-CSRFToken', csrfToken);
        return headers.append('Mode', 'same-origin');
    }

    topUpBalance(appUuid: string, value: number): Observable<{success: boolean, confirmation_url?: string}> {
        const url = `${BASE_URL}user_balance_top_up`;
        const httpOptions = this.httpOptions;
        return this.httpClient.post<{success: boolean, confirmation_url?: string}>(url, {appUuid, value}, httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    submitPromoCode(appUuid: string, promoCode: string): Observable<{success: boolean, message: string}> {
        const url = `${BASE_URL}${this.locale}/user_balance_promo_code`;
        const httpOptions = this.httpOptions;
        return this.httpClient.post<{success: boolean, message: string}>(url, {appUuid, promoCode}, httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    handleError<T>(error: HttpErrorResponse): Observable<any> {
        // if (error.status && [401, 403].indexOf(error.status) > -1) {
        //     window.location.href = '/login';
        // }
        if (error.error) {
            return throwError(error.error);
        }
        if (error.message) {
            return throwError(() => error.message);
        }
        return throwError(error.error);
    }
}
