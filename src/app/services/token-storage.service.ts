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
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(REFRESHTOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
    }

    saveToken(token: string): void {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);

        const user = this.getUser();
        if (user?.username) {
            this.saveUser({ ...user, accessToken: token });
        }
    }

    getToken(): string | null {
        return window.localStorage.getItem(TOKEN_KEY);
    }

    saveRefreshToken(token: string): void {
        window.localStorage.removeItem(REFRESHTOKEN_KEY);
        window.localStorage.setItem(REFRESHTOKEN_KEY, token);
    }

    getRefreshToken(): string | null {
        return window.localStorage.getItem(REFRESHTOKEN_KEY);
    }

    saveUser(user: any): void {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    getUser(): User {
        const user = window.localStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }
}
