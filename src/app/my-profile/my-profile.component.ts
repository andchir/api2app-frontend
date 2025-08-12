import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';
import { matchValidator } from '../helpers/match-validator';

import { environment } from '../../environments/environment';
import { BASE_URL } from '../../environments/environment';
const ROBOKASSA_URL = environment.robokassaUrl;

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
    action: 'update_profile'|'change_password'|'payments' = 'update_profile';
    destroyed$: Subject<void> = new Subject();
    imageFile: File;
    paymentStatus: string = 'allowed';
    passwordShow1: boolean = false;
    passwordShow2: boolean = false;
    robokassaUrl: string = ROBOKASSA_URL;

    showRobokassaInfo: boolean = false;
    robokassaResultURL: string = `${BASE_URL}rk_result/`;
    robokassaSuccessURL: string = `${BASE_URL}rk_success/`;
    robokassaFailURL: string = `${BASE_URL}rk_fail/`;

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

    formPayments = this.formBuilder.group({
        rkLogin: ['', []],
        rkPassword1: ['', []],
        rkPassword2: ['', []],
        vatCode: [1, []]
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
            this.getCurrentUser();
        } else {
            this.router.navigate(['/auth', 'login']);
        }
    }

    onSubmit(): void {
        this.message = '';
        if (!this.form.valid || this.submitted) {
            this.messageType = 'error';
            this.message = $localize `Please correct errors in filling out the form.`;
            return;
        }
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
                    this.authService.userSubject.next(res);
                    this.submitted = false;
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    if (err?.error?.email) {
                        this.errors['email'] = err?.error.email.join(' ');
                    }
                    if (err?.error?.userprofile) {
                        this.errors['userprofile'] = err?.error.userprofile.join(' ');
                    }
                    this.submitted = false;
                }
            });
    }

    onSubmitPassword(): void {
        this.message = '';
        if (!this.formChangePassword.valid || this.submitted) {
            this.messageType = 'error';
            this.message = $localize `Please correct errors in filling out the form.`;
            return;
        }
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

    onSubmitPayments(): void {
        this.message = '';
        if (this.submitted) {
            return;
        }
        this.submitted = true;
        this.errors = {};

        const {rkLogin, rkPassword1, rkPassword2, vatCode} = this.formPayments.value;

        this.authService.updatePaymentsSettings(this.user.username, rkLogin, rkPassword1, rkPassword2, vatCode)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.messageType = 'success';
                    this.message = $localize `Your profile has been successfully changed.`;
                    this.submitted = false;
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    if (err?.error?.email) {
                        this.errors['email'] = err?.error.email.join(' ');
                    }
                    if (err?.error?.userprofile) {
                        this.errors['userprofile'] = err?.error.userprofile.join(' ');
                    }
                    this.submitted = false;
                }
            });
    }

    getCurrentUser(): void {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (res.userprofile?.rkLogin) {
                        this.formPayments.controls['rkLogin'].setValue(res.userprofile.rkLogin);
                    }
                    if (res.userprofile?.rkPassword1) {
                        this.formPayments.controls['rkPassword1'].setValue(res.userprofile.rkPassword1);
                    }
                    if (res.userprofile?.rkPassword2) {
                        this.formPayments.controls['rkPassword2'].setValue(res.userprofile.rkPassword2);
                    }
                    if (res.userprofile?.paymentStatus) {
                        this.paymentStatus = res.userprofile.paymentStatus;
                    }
                    if (res.userprofile?.vatCode) {
                        this.formPayments.controls['vatCode'].setValue(res.userprofile.vatCode);
                    }
                    this.robokassaResultURL += this.user.username;
                    this.robokassaSuccessURL += this.user.username;
                    this.robokassaFailURL += this.user.username;
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                }
            });
    }

    updateAction(action: 'update_profile'|'change_password'|'payments', event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        if (this.action === action) {
            return;
        }
        this.action = action;
    }

    showRobokassaInfoModalToggle(): void {
        this.showRobokassaInfo = !this.showRobokassaInfo;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
