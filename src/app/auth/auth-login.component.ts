import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import {Subject, takeUntil} from 'rxjs';

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
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorage: TokenStorageService,
        private userService: UserService
    ) {
    }

    ngOnInit(): void {
        if (this.tokenStorage.getToken()) {
            this.isLoggedIn = true;
            this.user = this.tokenStorage.getUser();
            this.groups = this.user?.groups || [];
            this.getCurrentUser();
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
                    this.tokenStorage.saveToken(res.access);
                    this.tokenStorage.saveRefreshToken(res.refresh);
                    this.isLoggedIn = true;
                    this.getCurrentUser();
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    this.isLoggedIn = true;
                    this.submitted = false;
                }
            });
    }

    getCurrentUser(): void {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.user = res;
                    this.tokenStorage.saveUser(this.user);
                    this.submitted = false;
                    this.navigateHomePage();
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

    private navigateHomePage(): void {

    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
