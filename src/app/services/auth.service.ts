import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from "../apis/models/user.interface";

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
        private router: Router,
        private httpClient: HttpClient
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

    refreshToken(token: string): Observable<{access: string}> {
        return this.httpClient.post<{access: string}>(`${BASE_URL}token/refresh/`, {
            refresh: token
        }, this.httpOptions);
    }

    saveNextRoute(route: string): void {
        window.sessionStorage.setItem(NEXT_ROUTE_KEY, route);
    }

    getNextRoute(): string | null {
        return window.sessionStorage.getItem(NEXT_ROUTE_KEY);
    }

    navigateLogin(): void {
        if (this.router.url.includes('/auth')) {
            return;
        }
        this.saveNextRoute(this.router.url);
        this.router.navigate(['/auth', 'login']);
    }

    navigateLogout(): void {
        if (this.router.url.includes('/auth')) {
            return;
        }
        this.saveNextRoute(this.router.url);
        this.router.navigate(['/auth', 'logout']);
    }

    navigateBack(): void {
        const nextRoute = this.getNextRoute();
        this.router.navigate(nextRoute ? [nextRoute] : ['/']);
    }
}
