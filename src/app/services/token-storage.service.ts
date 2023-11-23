import { Injectable } from '@angular/core';

import { User } from '../apis/models/user.interface';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    constructor() { }

    signOut(): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
        window.sessionStorage.removeItem(USER_KEY);
    }

    saveToken(token: string): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.setItem(TOKEN_KEY, token);

        const user = this.getUser();
        if (user?.username) {
            this.saveUser({ ...user, accessToken: token });
        }
    }

    getToken(): string | null {
        return window.sessionStorage.getItem(TOKEN_KEY);
    }

    saveRefreshToken(token: string): void {
        window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
        window.sessionStorage.setItem(REFRESHTOKEN_KEY, token);
    }

    getRefreshToken(): string | null {
        return window.sessionStorage.getItem(REFRESHTOKEN_KEY);
    }

    saveUser(user: any): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    getUser(): User {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }
}
