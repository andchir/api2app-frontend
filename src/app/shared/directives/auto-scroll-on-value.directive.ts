import { Directive, DoCheck, ElementRef, Input, OnDestroy } from '@angular/core';

import { AppBlockElement } from '../../apps/models/app-block.interface';


@Directive({
    selector: '[appAutoScrollOnValue]',
    standalone: false
})
export class AutoScrollOnValueDirective implements DoCheck, OnDestroy {

    @Input('appAutoScrollOnValue') element: AppBlockElement;

    private previousValue: unknown;
    private previousValueArr: unknown;
    private previousValueObj: unknown;
    private initialized = false;
    private scrollFrame: number | null = null;
    private scrollAttempts = 0;

    constructor(private readonly host: ElementRef<HTMLElement>) {
    }

    ngDoCheck(): void {
        const element = this.element;
        if (!element) {
            return;
        }
        const value = element.value;
        const valueArr = element.valueArr;
        const valueObj = element.valueObj;
        if (value === this.previousValue
            && valueArr === this.previousValueArr
            && valueObj === this.previousValueObj) {
            return;
        }
        this.previousValue = value;
        this.previousValueArr = valueArr;
        this.previousValueObj = valueObj;
        // Skip the value the element already had when it was first rendered.
        if (!this.initialized) {
            this.initialized = true;
            return;
        }
        if (!element.autoScrollOnValue || !AutoScrollOnValueDirective.hasValue(value, valueArr, valueObj)) {
            return;
        }
        this.scheduleScroll();
    }

    ngOnDestroy(): void {
        this.cancelScheduledScroll();
    }

    private static hasValue(value: unknown, valueArr: unknown, valueObj: unknown): boolean {
        if (valueObj !== null && valueObj !== undefined) {
            return true;
        }
        if (Array.isArray(valueArr)) {
            return valueArr.length > 0;
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    }

    private scheduleScroll(): void {
        this.cancelScheduledScroll();
        this.scrollAttempts = 0;
        this.scrollFrame = requestAnimationFrame(() => this.scrollToElement());
    }

    private scrollToElement(): void {
        this.scrollFrame = null;
        const hostElement = this.host.nativeElement;
        // The element can still be hidden until the new value is rendered.
        if (hostElement.getClientRects().length === 0) {
            if (this.scrollAttempts < 20) {
                this.scrollAttempts += 1;
                this.scrollFrame = requestAnimationFrame(() => this.scrollToElement());
            }
            return;
        }
        hostElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    private cancelScheduledScroll(): void {
        if (this.scrollFrame !== null) {
            cancelAnimationFrame(this.scrollFrame);
            this.scrollFrame = null;
        }
    }
}
