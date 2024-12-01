import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-percent',
    templateUrl: 'percent.component.html',
    imports: [
        NgIf
    ],
    providers: []
})
export class PercentComponent implements OnInit, OnDestroy, OnChanges {

    @ViewChild('canvas', {static: true}) canvas;
    @Input() size = 100;
    @Input() valueCurrent = 1;
    @Input() valueTotal = 1;
    @Input() stepNumber = 1;
    @Input() stepsCount = 1;
    @Input() percentCurrent = 0;
    @Input() textColor = '#6875f5';
    @Input() currentColor = '#6875f5';
    @Input() totalColor = '#dedede';
    @Input() circleLineWidth = 5;
    @Input() fontSize = 20;

    timestampStart: number;
    isPaused = false;
    private percent = 0;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        setTimeout(() => {
            this.drawPercent(0);
        }, 1);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['valueCurrent']) {
            this.percentCurrent = this.getPercent(this.valueCurrent, this.valueTotal);
            this.drawPercentAnimateStart();
        } else if (changes['percentCurrent']) {
            this.drawPercentAnimateStart();
        }
    }

    getPercent(valueCurrent: number, valueTotal: number): number {
        return valueTotal > valueCurrent
            ? Math.round((valueCurrent / valueTotal) * 100)
            : 100;
    }

    drawPercent(percent: number): void {
        const ctx = this.canvas.nativeElement.getContext('2d');
        const CIRCLE_RADIUS = this.size / 2;

        ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(CIRCLE_RADIUS, CIRCLE_RADIUS);
        ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, 2 * Math.PI, false);
        ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS - this.circleLineWidth, 0, 2 * Math.PI, true);
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(CIRCLE_RADIUS, CIRCLE_RADIUS);
        ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.totalColor;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(CIRCLE_RADIUS, CIRCLE_RADIUS);
        ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS, -0.5 * Math.PI, (percent / 100) * 2 * Math.PI - 0.5 * Math.PI, false);
        ctx.fillStyle = this.currentColor;
        ctx.fill();

        ctx.restore();

        ctx.moveTo(CIRCLE_RADIUS, CIRCLE_RADIUS);
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${this.fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.floor(percent)}%`, CIRCLE_RADIUS, CIRCLE_RADIUS);
    }

    drawPercentAnimateStart(): void {
        if (this.isPaused || this.percentCurrent === this.percent) {
            return;
        }
        // window.requestAnimationFrame(this.drawPercentAnimate.bind(this));
        this.drawPercentAnimate(0);
    }

    drawPercentAnimate(timestamp: number): void {
        if (this.isPaused) {
            return;
        }
        if (!this.timestampStart) {
            this.timestampStart = timestamp;
        }

        const ANIMATION_DURATION = 500;
        const progress = timestamp - this.timestampStart;
        const animationPercent = progress ? Math.min(1, progress / ANIMATION_DURATION) : 0;

        if (this.percentCurrent >= this.percent) {
            const value = (this.percentCurrent - this.percent) * animationPercent;
            if (value > 0) {
                this.drawPercent(this.percent + value);
            }
        } else {
            const value = (this.percent - this.percentCurrent) * animationPercent;
            if (value > 0) {
                this.drawPercent(this.percent - value);
            }
        }

        if (progress < ANIMATION_DURATION) {
            window.requestAnimationFrame(this.drawPercentAnimate.bind(this));
        } else {
            this.timestampStart = null;
            this.percent = this.percentCurrent;
        }
    }

    ngOnDestroy(): void {
        this.isPaused = true;
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
