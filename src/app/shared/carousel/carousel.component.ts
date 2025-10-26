import { Component, Input, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';

import { ApplicationItem } from '../../apps/models/application-item.interface';

export interface CarouselItem {
    image: string;
    caption: string;
    alt?: string;
}

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html'
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
    @Input() items: ApplicationItem[] = [];
    @Input() showArrows: boolean = true;
    @Input() showIndicators: boolean = true;
    @Input() desktopSlides: number = 4;
    @Input() tabletSlides: number = 2;
    @Input() mobileSlides: number = 1;
    @Input() desktopBreakpoint: number = 1024;
    @Input() tabletBreakpoint: number = 640;

    currentIndex = 0;
    isDragging = false;
    startPos = 0;
    currentTranslate = 0;
    prevTranslate = 0;
    animationId: number | null = null;
    slidesToShow = 4;
    currentView: 'desktop' | 'tablet' | 'mobile' = 'desktop';

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        this.updateSlidesToShow();
        this.setSliderPosition();
        window.addEventListener('resize', this.updateSlidesToShow.bind(this));
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.updateSlidesToShow.bind(this));
    }

    private updateSlidesToShow() {
        const width = window.innerWidth;

        if (width >= this.desktopBreakpoint) {
            // Desktop
            this.slidesToShow = this.desktopSlides;
            this.currentView = 'desktop';
        } else if (width >= this.tabletBreakpoint) {
            // Tablet
            this.slidesToShow = this.tabletSlides;
            this.currentView = 'tablet';
        } else {
            // Mobile
            this.slidesToShow = this.mobileSlides;
            this.currentView = 'mobile';
        }

        if (this.currentIndex > this.maxIndex) {
            this.currentIndex = Math.max(0, this.maxIndex);
        }

        this.setSliderPosition();
    }

    get slideWidth(): number {
        return 100 / this.slidesToShow;
    }

    get maxIndex(): number {
        return Math.max(0, this.items.length - this.slidesToShow);
    }

    get canNavigate(): boolean {
        return this.items.length > this.slidesToShow;
    }

    next() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
            this.setSliderPosition();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.setSliderPosition();
        }
    }

    goToSlide(index: number) {
        if (index >= 0 && index <= this.maxIndex) {
            this.currentIndex = index;
            this.setSliderPosition();
        }
    }

    private setSliderPosition(translateX?: number) {
        const slider = this.elementRef.nativeElement.querySelector('.carousel-slider') as HTMLElement;
        if (slider) {
            const finalTranslateX = translateX !== undefined ? translateX : -this.currentIndex * this.slideWidth;
            slider.style.transform = `translateX(${finalTranslateX}%)`;
        }
    }

    // Touch events
    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        event.preventDefault();
        this.startPos = this.getPositionX(event);
        this.isDragging = true;

        this.prevTranslate = -this.currentIndex * this.slideWidth;
        this.currentTranslate = this.prevTranslate;

        this.animationId = requestAnimationFrame(this.animation.bind(this));
    }

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        if (!this.isDragging) {
            return;
        }
        event.preventDefault();
        const currentPosition = this.getPositionX(event);
        const containerWidth = this.getContainerWidth();

        const dragDistance = currentPosition - this.startPos;
        const dragPercentage = (dragDistance / containerWidth) * 100;
        if (Math.abs(dragPercentage) > 20) {
            this.isDragging = false;
            return;
        }

        this.currentTranslate = this.prevTranslate + dragPercentage;
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd() {
        this.endDrag();
    }

    @HostListener('touchcancel', ['$event'])
    onTouchCancel() {
        this.endDrag();
    }

    // Mouse events
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.startPos = this.getPositionX(event);
        this.isDragging = true;

        this.prevTranslate = -this.currentIndex * this.slideWidth;
        this.currentTranslate = this.prevTranslate;

        this.animationId = requestAnimationFrame(this.animation.bind(this));

        document.body.classList.add('select-none', 'cursor-grabbing');

        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) {
            return;
        }
        event.preventDefault();
        const currentPosition = this.getPositionX(event);
        const containerWidth = this.getContainerWidth();

        const dragDistance = currentPosition - this.startPos;
        const dragPercentage = (dragDistance / containerWidth) * 100;
        if (Math.abs(dragPercentage) > 20) {
            this.isDragging = false;
            return;
        }

        this.currentTranslate = this.prevTranslate + dragPercentage;
    }

    onMouseUp(event: MouseEvent) {
        event.preventDefault();
        this.endDrag();

        document.body.classList.remove('select-none', 'cursor-grabbing');

        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }

    private endDrag() {
        this.isDragging = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        const dragDistance = this.currentTranslate - this.prevTranslate;
        const dragThreshold = 10;

        if (Math.abs(dragDistance) > dragThreshold) {
            if (dragDistance < 0 && this.currentIndex < this.maxIndex) {
                this.currentIndex++;
            } else if (dragDistance > 0 && this.currentIndex > 0) {
                this.currentIndex--;
            }
        }

        this.currentTranslate = -this.currentIndex * this.slideWidth;
        this.prevTranslate = this.currentTranslate;
        this.setSliderPosition();
    }

    private getPositionX(event: TouchEvent | MouseEvent): number {
        return event.type.includes('mouse')
            ? (event as MouseEvent).clientX
            : (event as TouchEvent).touches[0].clientX;
    }

    private getContainerWidth(): number {
        const container = this.elementRef.nativeElement.querySelector('.carousel-container') as HTMLElement;
        return container ? container.offsetWidth : 1;
    }

    private animation() {
        this.setSliderPosition(this.currentTranslate);

        if (this.isDragging) {
            this.animationId = requestAnimationFrame(this.animation.bind(this));
        }
    }

    getIndicatorArray(): any[] {
        const indicatorCount = this.maxIndex + 1;
        return Array.from({ length: indicatorCount });
    }

    get showArrowsCurrent(): boolean {
        return this.showArrows && this.canNavigate;
    }
}

