import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';

@Component({
    selector: 'app-auth-login',
    templateUrl: './templates/auth-login.component.html',
    providers: [UserService]
})
export class AuthLoginComponent implements OnInit, OnDestroy {

    loading = false;
    submitted = false;
    isLoggedIn = false;
    message = '';
    messageType = 'error';
    user: User;
    groups: string[] = [];
    destroyed$: Subject<void> = new Subject();
    passwordShow: boolean = false;

    social_auth_items: {name: string, icon: string, url: string}[] = [];

    form = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
        this.social_auth_items = [
            {
                name: 'Google',
                icon: 'bi bi-google me-2',
                url: `/${locale}/accounts/google/login/`
            },
            {
                name: 'GitHub',
                icon: 'bi bi-github me-2',
                url: `/${locale}/accounts/github/login/`
            },
            {
                name: 'Yandex',
                icon: 'bi me-2',
                url: `/${locale}/accounts/yandex/login/`
            },
            {
                name: 'VK',
                icon: 'bi me-2',
                url: `/${locale}/accounts/vk/login/`
            }
        ];
    }

    ngOnInit(): void {
        if (this.tokenStorageService.getToken()) {
            this.isLoggedIn = true;
            this.user = this.tokenStorageService.getUser();
            this.groups = this.user?.groups || [];
            this.getCurrentUser(false);
        }
    }

    onSubmit(): void {
        if (!this.form.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        const { username, password } = this.form.value;
        this.authService.login(username, password)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.tokenStorageService.saveToken(res.access);
                    this.tokenStorageService.saveRefreshToken(res.refresh);
                    this.isLoggedIn = true;
                    this.getCurrentUser();
                },
                error: (err) => {
                    console.log(err);
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    this.isLoggedIn = false;
                    this.submitted = false;
                }
            });
    }

    getCurrentUser(navigateBack = true): void {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.user = res;
                    this.tokenStorageService.saveUser(this.user);
                    this.authService.userSubject.next(this.user);
                    this.submitted = false;
                    if (navigateBack) {
                        this.navigateBack();
                    }
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    this.isLoggedIn = true;
                    this.submitted = false;
                }
            });
    }

    reloadPage(): void {
        window.location.reload();
    }

    private navigateBack(): void {
        this.authService.navigateBack();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
