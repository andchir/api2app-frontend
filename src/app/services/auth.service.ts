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

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private httpClient: HttpClient
    ) {

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
        return this.httpClient.post<{access: string, refresh: string}>(`${BASE_URL}${this.locale}/auth/jwt/create/`, {
            username,
            password
        }, this.httpOptions);
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.httpClient.post(`${BASE_URL}${this.locale}/auth/users/`, {
            username,
            email,
            password
        }, this.httpOptions);
    }

    refreshToken(token: string): Observable<{access: string}> {
        return this.httpClient.post<{access: string}>(`${BASE_URL}${this.locale}/auth/jwt/refresh/`, {
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
