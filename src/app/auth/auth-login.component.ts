import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';

@Component({
    selector: 'app-auth-login',
    templateUrl: './auth-login.component.html',
    styleUrls: ['./auth-login.component.css'],
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

    form = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
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
