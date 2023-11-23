import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../apis/models/user.interface';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const USER_KEY = 'auth-user';
const NEXT_ROUTE_KEY = 'next-route';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    constructor(
        private router: Router
    ) { }

    signOut(): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
        window.sessionStorage.removeItem(USER_KEY);
    }

    public saveToken(token: string): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.setItem(TOKEN_KEY, token);

        const user = this.getUser();
        if (user?.username) {
            this.saveUser({ ...user, accessToken: token });
        }
    }

    public getToken(): string | null {
        return window.sessionStorage.getItem(TOKEN_KEY);
    }

    public saveRefreshToken(token: string): void {
        window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
        window.sessionStorage.setItem(REFRESHTOKEN_KEY, token);
    }

    public getRefreshToken(): string | null {
        return window.sessionStorage.getItem(REFRESHTOKEN_KEY);
    }

    public saveUser(user: any): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public getUser(): User {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }

    public saveNextRoute(route: string): void {
        window.sessionStorage.setItem(NEXT_ROUTE_KEY, route);
    }

    public getNextRoute(): string | null {
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
}
