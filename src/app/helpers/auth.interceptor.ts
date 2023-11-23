import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private tokenStorageService: TokenStorageService,
        private authService: AuthService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq = req;
        const token = this.tokenStorageService.getToken();
        if (token != null && !authReq.url.includes('/token/')) {
            authReq = this.addTokenHeader(req, token);
        }
        return next.handle(authReq)
            .pipe(catchError(error => {
                if (error instanceof HttpErrorResponse && !authReq.url.includes('/token/') && [401, 403].includes(error.status)) {
                    return this.handle401Error(authReq, next);
                }
                return throwError(() => new Error('forbidden'));
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
                    return throwError(err);
                })
            );
        }
        if (!token) {
            return throwError(() => new Error('forbidden'));
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
