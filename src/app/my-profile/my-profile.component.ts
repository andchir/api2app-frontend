import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';
import { matchValidator } from '../helpers/match-validator';

@Component({
    selector: 'app-dashboard',
    templateUrl: './my-profile.component.html',
    styleUrls: [],
    providers: [UserService]
})
export class MyProfileComponent implements OnInit, OnDestroy {

    loading = false;
    submitted = false;
    message = '';
    messageType = 'error';
    errors: {[key: string]: string} = {};
    user: User;
    action: 'update_profile'|'change_password' = 'update_profile';
    destroyed$: Subject<void> = new Subject();
    imageFile: File;

    form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', []],
        lastName: ['', []]
    });

    formChangePassword = this.formBuilder.group({
        currentPassword: ['', [
            Validators.required
        ]],
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

    ngOnInit(): void {
        if (this.tokenStorageService.getToken()) {
            this.user = this.tokenStorageService.getUser();
            if (this.user.email) {
                this.form.controls['email'].setValue(this.user.email);
            }
            if (this.user.first_name) {
                this.form.controls['firstName'].setValue(this.user.first_name);
            }
            if (this.user.last_name) {
                this.form.controls['lastName'].setValue(this.user.last_name);
            }
        } else {
            this.router.navigate(['/auth', 'login']);
        }
    }

    onSubmit(): void {
        if (!this.form.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        this.errors = {};

        const {email, firstName, lastName} = this.form.value;

        this.authService.updateProfile(email, this.user.username, firstName, lastName, this.imageFile)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.messageType = 'success';
                    this.message = $localize `Your profile has been successfully changed.`;
                    this.tokenStorageService.saveUser(Object.assign({}, this.user, res));
                    this.submitted = false;
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    if (err?.error?.email) {
                        this.errors['email'] = err?.error?.email.join(' ');
                    }
                    this.submitted = false;
                }
            });
    }

    onSubmitPassword(): void {
        if (!this.formChangePassword.valid || this.submitted) {
            return;
        }
        this.message = '';
        this.submitted = true;
        this.errors = {};

        const {currentPassword, password} = this.formChangePassword.value;

        this.authService.passwordSet(currentPassword, password)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.messageType = 'success';
                    this.message = $localize `The password has been successfully changed.`;
                    this.formChangePassword.reset();
                    this.submitted = false;
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    if (err?.error?.current_password) {
                        this.errors['current_password'] = err?.error?.current_password.join(' ');
                    }
                    this.submitted = false;
                }
            });
    }

    updateAction(action: 'update_profile'|'change_password', event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        if (this.action === action) {
            return;
        }
        this.action = action;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
