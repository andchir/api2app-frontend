import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable, LOCALE_ID} from '@angular/core';

import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../apis/models/user.interface';

const BASE_URL = environment.apiUrl;

@Injectable()
export class UserService {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private httpClient: HttpClient
    ) {}

    getCurrentUser(): Observable<User> {
        const url = `${BASE_URL}${this.locale}/api/v1/users/current`;
        return this.httpClient.get<User>(url, this.httpOptions)
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
