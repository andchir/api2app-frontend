import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../apis/models/user.interface';

const BASE_URL = environment.apiUrl;
const NEXT_ROUTE_KEY = 'next-route';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    public userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    protected requestUrl = '';

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private httpClient: HttpClient
    ) {
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/auth/`;
    }

    getHeaders(): HttpHeaders {
        const csrfToken = this.getCookie('csrftoken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || window['csrf_token'] || '',
            'Mode': 'same-origin'
        });
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

    activateUser(uid: string, token: string): Observable<any> {
        return this.httpClient.post(`${this.requestUrl}users/activation/`, {
            uid, token
        }, this.httpOptions);
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
}
