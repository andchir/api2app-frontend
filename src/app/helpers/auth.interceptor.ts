import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { BASE_URL } from '../../environments/environment';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private tokenStorageService: TokenStorageService,
        private authService: AuthService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq = req;
        const token = this.tokenStorageService.getToken();
        const urlsWhitelist = [
            `${BASE_URL}api/v1/proxy`,
            `${BASE_URL}${this.locale}/api/v1/auth/users/`,
            `${BASE_URL}${this.locale}/api/v1/auth/users/activation/`,
            `${BASE_URL}${this.locale}/api/v1/auth/users/reset_password/`,
            `${BASE_URL}${this.locale}/api/v1/token`,
            `${BASE_URL}${this.locale}/api/v1/token/refresh`,
            `${BASE_URL}${this.locale}/api/v1/token/verify`,
            `${BASE_URL}${this.locale}/api/v1/auth/jwt/create/`,
            `${BASE_URL}${this.locale}/api/v1/auth/jwt/refresh/`,
            `${BASE_URL}${this.locale}/api/v1/auth/jwt/verify/`,
            `${BASE_URL}${this.locale}/api/v1/api_items/list_shared`,
            `${BASE_URL}${this.locale}/api/v1/applications/list_shared`
        ];
        if (authReq.url.match(/\/api_items\/[^\/]+\/shared$/)) {
            urlsWhitelist.push(authReq.url);
        }
        if (authReq.url.match(/\/applications\/[^\/]+\/shared$/)) {
            urlsWhitelist.push(authReq.url);
        }
        if (token != null && !urlsWhitelist.includes(authReq.url) && authReq.url.includes(BASE_URL)) {
            authReq = this.addTokenHeader(req, token);
        }
        return next.handle(authReq)
            .pipe(catchError(error => {
                if (error instanceof HttpErrorResponse
                    && [401, 403].includes(error.status)
                    && !urlsWhitelist.includes(authReq.url)
                    && authReq.url.includes(BASE_URL)) {
                        return this.handle401Error(authReq, next);
                }
                return throwError(error);
            }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        const token = this.tokenStorageService.getRefreshToken();

        if (!this.isRefreshing && token) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken(token).pipe(
                switchMap((token) => {
                    this.isRefreshing = false;
                    this.tokenStorageService.saveToken(token.access);
                    this.refreshTokenSubject.next(token.access);

                    return next.handle(this.addTokenHeader(request, token.access));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.tokenStorageService.signOut();
                    setTimeout(() => {
                        this.authService.navigateAuthPage('login');
                    }, 1);
                    return throwError(err);
                })
            );
        }
        if (!token) {
            const forbiddenMessage = $localize `Access Denied`;
            return throwError(() => new Error(forbiddenMessage));
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({
            headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`)
        });
    }
}

export const authInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
