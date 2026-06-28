import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

import { Subject, takeUntil } from 'rxjs';

import { UserBalanceService } from '../../services/user-balance.service';
import { SharedModule } from '../../shared.module';
import { VkAppOptions } from '../models/vk-app-options.interface';

declare const vkBridge: any;

@Component({
    selector: 'app-top-up-balance',
    templateUrl: './modal-topup-balance.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        NgClass,
        SharedModule
    ],
    styleUrls: [],
    providers: [UserBalanceService]
})
export class ModalTopUpBalanceComponent implements OnInit {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();

    submitted: boolean = false;
    appUuid: string = '';
    isVkApp: boolean = false;
    vkAppOptions: VkAppOptions = {};
    value: number = 100;
    messageType: string = 'success';
    message: string = '';
    promoCode: string = '';
    tabCurrent: 'balance'|'promo_code' = 'balance';
    destroyed$: Subject<void> = new Subject();

    constructor(
        private cdr: ChangeDetectorRef,
        private userBalanceService: UserBalanceService
    ) {
    }

    ngOnInit(): void {

    }

    switchTab(tab_name: 'balance'|'promo_code', event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        if (this.submitted || this.tabCurrent === tab_name) {
            return;
        }
        this.tabCurrent = tab_name;
    }

    closeModal(reason: string = 'close'): void {
        if (this.submitted) {
            return;
        }
        this.close.emit(reason);
    }

    submitPromoCode(): void {
        if (!this.promoCode) {
            return;
        }
        this.message = '';
        this.submitted = true;
        this.userBalanceService.submitPromoCode(this.appUuid, this.promoCode, this.isVkApp ? this.vkAppOptions : undefined)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.submitted = false;
                    if (res.success) {
                        this.closeModal('promo_code_success');
                    } else {
                        if (res.message) {
                            this.messageType = 'error';
                            this.message = res.message;
                        }
                    }
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.submitted = false;
                    if (err.message) {
                        this.messageType = 'error';
                        this.message = err.message;
                    }
                    this.cdr.markForCheck();
                }
            });
    }

    submit(): void {
        if (this.value < 1) {
            this.messageType = 'error';
            this.message = $localize `Please enter a valid amount.`;
            return;
        }
        this.message = '';
        this.submitted = true;

        if (this.isVkApp) {
            this.submitVkPay();
            return;
        }

        this.userBalanceService.topUpBalance(this.appUuid, this.value)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (res.confirmation_url) {
                        window.location.href = res.confirmation_url;
                    } else {
                        this.submitted = false;
                    }
                },
                error: (err) => {
                    this.submitted = false;
                    if (err.message) {
                        this.messageType = 'error';
                        this.message = err.message;
                    }
                    this.cdr.markForCheck();
                }
            });
    }

    private submitVkPay(): void {
        this.userBalanceService.vkPayTopUp(this.appUuid, this.value, this.vkAppOptions)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (!res?.success || !res.params || typeof vkBridge === 'undefined') {
                        this.submitted = false;
                        this.messageType = 'error';
                        this.message = $localize `Unable to start payment.`;
                        this.cdr.markForCheck();
                        return;
                    }
                    vkBridge.send('VKWebAppOpenPayForm', {
                        app_id: res.app_id,
                        action: 'pay-to-service',
                        params: res.params
                    })
                        .then((data: any) => {
                            this.submitted = false;
                            if (data?.status) {
                                this.messageType = 'success';
                                this.message = $localize `Payment successful. Your balance will be updated shortly.`;
                                this.closeModal('vk_pay_success');
                            } else {
                                this.messageType = 'error';
                                this.message = $localize `Payment was not completed.`;
                            }
                            this.cdr.markForCheck();
                        })
                        .catch((error: any) => {
                            console.log(error);
                            this.submitted = false;
                            this.messageType = 'error';
                            this.message = $localize `Payment was not completed.`;
                            this.cdr.markForCheck();
                        });
                },
                error: (err) => {
                    this.submitted = false;
                    this.messageType = 'error';
                    this.message = err?.message || $localize `Unable to start payment.`;
                    this.cdr.markForCheck();
                }
            });
    }
}
