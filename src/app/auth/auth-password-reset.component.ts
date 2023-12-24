import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';

@Component({
    selector: 'app-password-reset',
    templateUrl: './templates/auth-password-reset.html',
    providers: [UserService]
})
export class AuthPasswordResetComponent implements OnInit, OnDestroy {

    loading = false;
    submitted = false;
    isLoggedIn = false;
    message = '';
    messageType = 'error';
    user: User;
    groups: string[] = [];
    destroyed$: Subject<void> = new Subject();

    form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
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
        }
    }

    onSubmit(): void {
        if (!this.form.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        const { email } = this.form.value;
        this.authService.passwordReset(email)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.messageType = 'success';
                    this.message = 'Please follow the instructions from the letter sent to your email.';
                    this.form.reset();
                    this.submitted = false;
                },
                error: (err) => {
                    console.log(err);
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    this.submitted = false;
                }
            });
    }

    private navigateBack(): void {
        this.authService.navigateBack();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
