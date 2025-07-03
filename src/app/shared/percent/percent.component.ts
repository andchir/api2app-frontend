import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-percent',
    templateUrl: 'percent.component.html',
    styleUrls: ['percent.component.css'],
    imports: [
        NgIf
    ],
    providers: []
})
export class PercentComponent implements OnInit, OnDestroy, OnChanges {

    @ViewChild('progressCircle', {static: true}) progressCircle: ElementRef<SVGCircleElement>;

    @Input() size = 100;
    @Input() valueCurrent = 1;
    @Input() valueTotal = 1;
    @Input() stepNumber = 1;
    @Input() stepsCount = 1;
    @Input() percentCurrent = 0;

    isPaused = false;
    private percent = 0;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.drawPercentSVG(0);
        setTimeout(() => {
            this.drawPercentSVG();
        }, 1);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['valueCurrent']) {
            this.percentCurrent = this.getPercent(this.valueCurrent, this.valueTotal);
            this.drawPercentSVG();
        } else if (changes['percentCurrent']) {
            this.drawPercentSVG();
        }
    }

    getPercent(valueCurrent: number, valueTotal: number): number {
        return valueTotal > valueCurrent
            ? Math.round((valueCurrent / valueTotal) * 100)
            : 100;
    }

    drawPercentSVG(percentValue: number|null = null): void {
        if (percentValue === null) {
            percentValue = this.percentCurrent;
        }
        const circumference = 283;
        if (this.progressCircle?.nativeElement) {
            this.progressCircle.nativeElement.style.strokeDashoffset = String(circumference - (percentValue / 100) * circumference);
        }
    }

    ngOnDestroy(): void {
        this.isPaused = true;
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
