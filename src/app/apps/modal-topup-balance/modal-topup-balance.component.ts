import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

import { Subject, takeUntil } from 'rxjs';

import { UserBalanceService } from '../../services/user-balance.service';
import { SharedModule } from '../../shared.module';

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
        console.log('submitPromoCode', this.promoCode);
        this.message = '';
        this.submitted = true;
        this.userBalanceService.submitPromoCode(this.appUuid, this.promoCode)
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
        this.message = '';
        this.submitted = true;
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
}
