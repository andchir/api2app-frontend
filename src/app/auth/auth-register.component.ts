import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { matchValidator } from '../helpers/match-validator';

@Component({
    selector: 'app-auth-register',
    templateUrl: './templates/auth-register.component.html',
    providers: [ UserService ]
})
export class AuthRegisterComponent implements OnInit, OnDestroy {

    loading = false;
    submitted = false;
    message = '';
    messageType = 'error';
    destroyed$: Subject<void> = new Subject();

    form = this.formBuilder.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
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
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
    }

    onSubmit(): void {
        console.log(this.form.valid, this.form.controls);
        if (!this.form.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        const { username, email, password } = this.form.value;
        this.authService.register(username, email, password)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {

                    this.submitted = false;
                },
                error: (err) => {
                    console.log(err?.error);
                    this.messageType = 'error';
                    if (err?.error?.password) {
                        this.message = err?.error?.password.join(' ');
                    } else if (err?.error?.username) {
                        this.message = err?.error?.username.join(' ');
                    } else {
                        this.message = 'Error.';
                    }
                    this.submitted = false;
                }
            });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
