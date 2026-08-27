import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import {
    PaymentSystemCredentials,
    PaymentSystemService
} from '../services/payment-system.service';
import { User } from '../apis/models/user.interface';
import { matchValidator } from '../helpers/match-validator';

import { environment } from '../../environments/environment';
import { BASE_URL } from '../../environments/environment';
type ProfileAction = 'update_profile' | 'change_password' | 'payments';

const ROBOKASSA_URL = environment.robokassaUrl;

@Component({
    selector: 'app-dashboard',
    templateUrl: './my-profile.component.html',
    styleUrls: [],
    providers: [UserService],
    standalone: false
})
export class MyProfileComponent implements OnInit {

    private readonly destroyRef = inject(DestroyRef);

    readonly submitted = signal(false);
    readonly message = signal('');
    readonly messageType = signal<'error' | 'success'>('error');
    readonly errors = signal<Record<string, string>>({});
    readonly user = signal<User | null>(null);
    readonly action = signal<ProfileAction>('update_profile');
    readonly imageFile = signal<File | undefined>(undefined);
    readonly paymentStatus = signal('allowed');
    readonly paymentSystem = signal<'robokassa'|'vk_pay'>('robokassa');
    readonly vkPayPaymentSystemId = signal<number | null>(null);
    readonly vkPayLoading = signal(false);
    readonly passwordShow1 = signal(false);
    readonly passwordShow2 = signal(false);
    readonly vkPayMerchantKeyShow = signal(false);
    readonly showRobokassaInfo = signal(false);
    readonly robokassaUrl = ROBOKASSA_URL;
    readonly vkPayUrl = 'https://dev.vk.ru/ru/pay/getting-started';

    private readonly robokassaUserPath = computed(() => this.user()?.username.toLowerCase() ?? '');
    readonly robokassaResultURL = computed(() => `${BASE_URL}rk_result/${this.robokassaUserPath()}`);
    readonly robokassaSuccessURL = computed(() => `${BASE_URL}rk_success/${this.robokassaUserPath()}`);
    readonly robokassaFailURL = computed(() => `${BASE_URL}rk_fail/${this.robokassaUserPath()}`);

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

    formVkPay = this.formBuilder.nonNullable.group({
        merchantId: ['', [Validators.pattern(/^[1-9]\d*$/)]],
        merchantKey: [''],
        notificationPublicKey: ['']
    });

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService,
        private paymentSystemService: PaymentSystemService
    ) {
    }

    ngOnInit(): void {
        if (this.tokenStorageService.getToken()) {
            const user = this.tokenStorageService.getUser();
            this.user.set(user);
            if (user.email) {
                this.form.controls.email.setValue(user.email);
            }
            if (user.first_name) {
                this.form.controls.firstName.setValue(user.first_name);
            }
            if (user.last_name) {
                this.form.controls.lastName.setValue(user.last_name);
            }
            this.getCurrentUser();
            this.loadVkPayPaymentSystem();
        } else {
            this.router.navigate(['/auth', 'login']);
        }
    }

    onSubmit(): void {
        this.message.set('');
        if (this.form.invalid || this.submitted()) {
            this.setMessage('error', $localize `Please correct errors in filling out the form.`);
            return;
        }
        this.startSubmission();

        const {email, firstName, lastName} = this.form.value;
        const user = this.user();
        if (!user) {
            this.submitted.set(false);
            return;
        }

        this.authService.updateProfile(email, user.username, firstName, lastName, this.imageFile())
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.submitted.set(false))
            )
            .subscribe({
                next: (res) => {
                    this.setMessage('success', $localize `Your profile has been successfully changed.`);
                    this.tokenStorageService.saveUser({...user, ...res});
                    this.authService.userSubject.next(res);
                },
                error: (err) => {
                    this.setMessage('error', err?.error?.detail);
                    this.setApiErrors(err, ['email', 'userprofile']);
                }
            });
    }

    onSubmitPassword(): void {
        this.message.set('');
        if (this.formChangePassword.invalid || this.submitted()) {
            this.setMessage('error', $localize `Please correct errors in filling out the form.`);
            return;
        }
        this.startSubmission();

        const {currentPassword, password} = this.formChangePassword.value;

        this.authService.passwordSet(currentPassword, password)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.submitted.set(false))
            )
            .subscribe({
                next: () => {
                    this.setMessage('success', $localize `The password has been successfully changed.`);
                    this.formChangePassword.reset();
                },
                error: (err) => {
                    this.setMessage('error', err?.error?.detail);
                    this.setApiErrors(err, ['current_password']);
                }
            });
    }

    onSubmitPayments(): void {
        this.message.set('');
        if (this.submitted()) {
            return;
        }
        this.startSubmission();

        const {rkLogin, rkPassword1, rkPassword2, vatCode} = this.formPayments.value;
        const user = this.user();
        if (!user) {
            this.submitted.set(false);
            return;
        }

        this.authService.updatePaymentsSettings(user.username, rkLogin, rkPassword1, rkPassword2, vatCode)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.submitted.set(false))
            )
            .subscribe({
                next: () => {
                    this.setMessage('success', $localize `Your profile has been successfully changed.`);
                },
                error: (err) => {
                    this.setMessage('error', err?.error?.detail);
                    this.setApiErrors(err, ['email', 'userprofile']);
                }
            });
    }

    onSubmitVkPay(): void {
        this.message.set('');
        if (this.formVkPay.invalid || this.submitted()) {
            this.formVkPay.markAllAsTouched();
            this.setMessage('error', $localize `Please correct errors in filling out the form.`);
            return;
        }

        this.startSubmission();
        const credentials: PaymentSystemCredentials = {
            system_name: 'vk_pay',
            merchant_id: this.formVkPay.controls.merchantId.value.trim(),
            merchant_key: this.formVkPay.controls.merchantKey.value.trim(),
            notification_public_key: this.formVkPay.controls.notificationPublicKey.value.trim()
        };
        const paymentSystemId = this.vkPayPaymentSystemId();
        const request = paymentSystemId === null
            ? this.paymentSystemService.create(credentials)
            : this.paymentSystemService.update(paymentSystemId, credentials);

        request.pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.submitted.set(false))
        ).subscribe({
            next: (paymentSystem) => {
                this.vkPayPaymentSystemId.set(paymentSystem.id);
                this.patchVkPayForm(paymentSystem);
                this.setMessage(
                    'success',
                    paymentSystemId === null
                        ? $localize `VK Pay settings have been successfully created.`
                        : $localize `VK Pay settings have been successfully changed.`
                );
            },
            error: (err) => {
                this.setMessage('error', err?.error?.detail || $localize `Failed to save VK Pay settings.`);
                this.setApiErrors(err, [
                    'merchant_id',
                    'merchant_key',
                    'notification_public_key',
                    'system_name'
                ]);
            }
        });
    }

    loadVkPayPaymentSystem(): void {
        if (this.vkPayLoading()) {
            return;
        }

        this.vkPayLoading.set(true);
        this.paymentSystemService.getByName('vk_pay').pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.vkPayLoading.set(false))
        ).subscribe({
            next: (paymentSystem) => {
                this.vkPayPaymentSystemId.set(paymentSystem.id);
                this.patchVkPayForm(paymentSystem);
            },
            error: (err) => {
                if (err?.status === 404) {
                    this.vkPayPaymentSystemId.set(null);
                    this.formVkPay.reset();
                    return;
                }
                this.setMessage('error', err?.error?.detail || $localize `Failed to load VK Pay settings.`);
            }
        });
    }

    getCurrentUser(): void {
        this.userService.getCurrentUser()
            .pipe(takeUntilDestroyed(this.destroyRef))
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
                        this.paymentStatus.set(res.userprofile.paymentStatus);
                    }
                    if (res.userprofile?.vatCode) {
                        this.formPayments.controls['vatCode'].setValue(res.userprofile.vatCode);
                    }
                },
                error: (err) => {
                    this.setMessage('error', err?.error?.detail);
                }
            });
    }

    updateAction(action: ProfileAction, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        if (this.action() === action) {
            return;
        }
        this.action.set(action);
    }

    showRobokassaInfoModalToggle(): void {
        this.showRobokassaInfo.update(value => !value);
    }

    private startSubmission(): void {
        this.submitted.set(true);
        this.errors.set({});
    }

    private setMessage(type: 'error' | 'success', message = ''): void {
        this.messageType.set(type);
        this.message.set(message);
    }

    private setApiErrors(error: any, fields: string[]): void {
        const errors = fields.reduce<Record<string, string>>((result, field) => {
            const messages = error?.error?.[field];
            if (messages) {
                result[field] = Array.isArray(messages) ? messages.join(' ') : String(messages);
            }
            return result;
        }, {});

        this.errors.set(errors);
    }

    private patchVkPayForm(paymentSystem: PaymentSystemCredentials): void {
        this.formVkPay.patchValue({
            merchantId: paymentSystem.merchant_id,
            merchantKey: paymentSystem.merchant_key,
            notificationPublicKey: paymentSystem.notification_public_key
        });
    }

    switchPaymentSystemTab(paymentSystem: 'robokassa'|'vk_pay', event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        this.paymentSystem.set(paymentSystem);
    }
}
