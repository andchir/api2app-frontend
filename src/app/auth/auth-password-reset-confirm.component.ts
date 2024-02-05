import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';
import {matchValidator} from "../helpers/match-validator";

@Component({
    selector: 'app-password-reset-confirm',
    templateUrl: './templates/auth-password-reset-confirm.component.html',
    providers: [UserService]
})
export class AuthPasswordResetConfirmComponent implements OnDestroy {

    loading = true;
    submitted = false;
    activated = false;
    message = '';
    messageType = 'error';
    user: User;
    destroyed$: Subject<void> = new Subject();

    form = this.formBuilder.group({
        password: ['', [
            Validators.required,
            Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
            Validators.minLength(8),
            Validators.maxLength(25),
            matchValidator('confirmPassword', true)
        ]],
        confirmPassword: ['', [
            matchValidator('password')
        ]]
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
    }

    onSubmit(): void {
        if (!this.form.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        this.activated = false;
        const { password } = this.form.value;
        const uid = this.route.snapshot.paramMap.get('uid');
        const token = this.route.snapshot.paramMap.get('token');
        this.authService.changePassword(uid, token, password)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.submitted = false;
                    this.activated = true;
                    this.form.reset();
                },
                error: (err) => {
                    // console.log(err);
                    this.messageType = 'error';
                    if (err?.error?.token || err?.error?.uid) {
                        this.message = err?.error?.token ? err?.error?.token.join(' ') : err?.error?.uid.join(' ');
                    } else if (err?.error?.detail) {
                        this.message = err?.error?.detail;
                    } else {
                        this.message = 'Error. Please try again later or contact support.';
                    }
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
