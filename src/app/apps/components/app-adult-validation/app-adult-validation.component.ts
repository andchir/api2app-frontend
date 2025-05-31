import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { NgForOf, NgIf } from '@angular/common';
import { VkBridgeService } from '../../../services/vk-bridge.service';


@Component({
    selector: 'app-adult-validation',
    templateUrl: './app-adult-validation.component.html',
    styleUrls: [],
    standalone: true,
    imports: [
        NgForOf,
        NgIf
    ],
    providers: []
})
export class AppAdultValidationComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();

    appUuid: string = '';
    userDobDay: string;
    userDobMonth: string;
    userDobYear: string;
    calendarDays: string[] = [];
    calendarMonths: string[] = [];
    calendarYears: string[] = [];
    adultsOnlyModalActive: boolean = false;
    adultsOnlyRestricted: boolean = false;

    constructor(
        protected vkBridgeService: VkBridgeService
    ) {}

    ngOnInit(): void {
        this.calendarDays = this.createPaddedNumberArray(1, 31);
        this.calendarMonths = this.createPaddedNumberArray(1, 12);
        this.calendarYears = this.createPaddedNumberArray(1910, 2010);

        const now = new Date();
        const hundredYearsAgo = new Date(now);
        hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

        this.adultsOnlyModalActive = true;
    }

    closeModal(reason: string = 'close'): void {
        this.close.emit(reason);
    }

    selectUserDob(number: string, target: string = 'day', dropdownEl: HTMLElement = null): void {
        if (target == 'day') {
            this.userDobDay = number;
        } else if (target === 'month') {
            this.userDobMonth = number;
        } else if (target === 'year') {
            this.userDobYear = number;
        }
        if (dropdownEl) {
            dropdownEl.classList.add('hidden');
        }
    }

    submitUserDate(): void {
        if (!this.userDobDay || !this.userDobMonth || !this.userDobYear) {
            return;
        }
        this.adultsOnlyModalActive = false;
        const dateString = `${this.userDobYear}-${this.userDobMonth}-${this.userDobDay}`;
        const age = this.vkBridgeService.calculateFullAgeIso(dateString);
        window.localStorage.setItem(`${this.appUuid}-appUserDob`, dateString);
        if (age < 18) {
            this.adultsOnlyRestricted = true;
            window.localStorage.setItem(`${this.appUuid}-ageRestricted`, '1');
        } else {
            window.localStorage.removeItem(`${this.appUuid}-ageRestricted`);
            this.closeModal('confirmed');
        }
    }

    createPaddedNumberArray(start: number, end: number): string[] {
        const result = [];
        for (let i = start; i <= end; i++) {
            const paddedNumber = i < 10 ? `0${i}` : `${i}`;
            result.push(paddedNumber);
        }
        return result;
    }

    ngOnDestroy(): void {

    }
}
