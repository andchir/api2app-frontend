import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const BASE_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(
        public httpClient: HttpClient
    ) {

    }

    login(username: string, password: string): Observable<{access: string, refresh: string}> {
        return this.httpClient.post<{access: string, refresh: string}>(`${BASE_URL}token/`, {
            username,
            password
        }, this.httpOptions);
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.httpClient.post(`${BASE_URL}register/`, {
            username,
            email,
            password
        }, this.httpOptions);
    }

    refreshToken(token: string) {
        return this.httpClient.post(`${BASE_URL}token/refresh/`, {
            refreshToken: token
        }, this.httpOptions);
    }
}
