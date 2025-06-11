import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL } from '../../environments/environment';
import { User } from '../apis/models/user.interface';
import { DataService } from './data.service.abstract';

const NEXT_ROUTE_KEY = 'next-route';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    public userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    httpOptionsFormData = {
        headers: new HttpHeaders({
            'enctype': 'multipart/form-data',
            'Accept': 'application/json'
        })
    };

    protected requestUrl = '';

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private httpClient: HttpClient
    ) {
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/auth/`;
        this.httpOptions.headers = this.addCsrfToken(this.httpOptions.headers);
        this.httpOptionsFormData.headers = this.addCsrfToken(this.httpOptionsFormData.headers);
    }

    getHeaders(): HttpHeaders {
        const csrfToken = window['csrf_token'] || DataService.getCookie('csrftoken') || '';
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'Mode': 'same-origin'
        });
    }

    addCsrfToken(headers: HttpHeaders): HttpHeaders {
        const csrfToken = window['csrf_token'] || DataService.getCookie('csrftoken') || '';
        headers = headers.append('X-CSRFToken', csrfToken);
        return headers.append('Mode', 'same-origin');
    }

    login(username: string, password: string): Observable<{access: string, refresh: string}> {
        return this.httpClient.post<{access: string, refresh: string}>(`${this.requestUrl}jwt/create/`, {
            username,
            password
        }, this.httpOptions);
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/`, {
            username,
            email,
            password
        }, this.httpOptions);
    }

    passwordReset(email: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/reset_password/`, {
            email
        }, this.httpOptions);
    }

    passwordSet(current_password: string, new_password: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/set_password/`, {
            current_password,
            new_password
        }, this.httpOptions);
    }

    updateProfile(email: string, username: string, first_name: string, last_name: string, avatar_file?: File): Observable<any> {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        if (avatar_file) {
            formData.append('userprofile.avatar', avatar_file, avatar_file.name);
        }
        const url = `${this.requestUrl}users/me/`
        return this.httpClient.put(url, formData, this.httpOptionsFormData);
    }

    updatePaymentsSettings(username: string, rkLogin: string, rkPassword1: string, rkPassword2: string, vatCode: number): Observable<any> {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('userprofile.rkLogin', rkLogin.trim());
        formData.append('userprofile.rkPassword1', rkPassword1.trim());
        formData.append('userprofile.rkPassword2', rkPassword2.trim());
        formData.append('userprofile.vatCode', String(vatCode));
        const url = `${this.requestUrl}users/me/`
        return this.httpClient.put(url, formData, this.httpOptionsFormData);
    }

    activateUser(uid: string, token: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/activation/`, {
            uid, token
        }, this.httpOptions);
    }

    userGetToken(): Observable<{access: string, refresh: string}> {
        return this.httpClient.post<{access: string, refresh: string}>(`${BASE_URL}${this.locale}/auth_session`, {}, {
            headers: this.getHeaders()
        });
    }

    userSessionDelete(): Observable<any> {
        return this.httpClient.delete<{access: string, refresh: string}>(`${BASE_URL}${this.locale}/_allauth/browser/v1/auth/session`, {
            headers: this.getHeaders()
        });
    }

    changePassword(uid: string, token: string, new_password: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/reset_password_confirm/`, {
            uid, token, new_password
        }, this.httpOptions);
    }

    refreshToken(token: string): Observable<{access: string}> {
        return this.httpClient.post<{access: string}>(`${this.requestUrl}jwt/refresh/`, {
            refresh: token
        }, this.httpOptions);
    }

    saveNextRoute(route: string): void {
        window.sessionStorage.setItem(NEXT_ROUTE_KEY, route);
    }

    getNextRoute(): string | null {
        return window.sessionStorage.getItem(NEXT_ROUTE_KEY);
    }

    navigateAuthPage(pageName: 'login'|'logout'|'register'): void {
        if (this.router.url.includes('/auth')) {
            return;
        }
        this.saveNextRoute(this.router.url);
        this.router.navigate(['/auth', pageName]);
    }

    navigateLogin(): void {
        this.navigateAuthPage('login');
    }

    navigateLogout(): void {
        this.navigateAuthPage('logout');
    }

    navigateBack(): void {
        const nextRoute = this.getNextRoute();
        this.router.navigate(nextRoute ? [nextRoute] : ['/']);
    }
}
