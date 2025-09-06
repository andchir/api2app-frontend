import { Component, Input, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-comparison',
    standalone: true,
    imports: [CommonModule],
    templateUrl: 'image-comparison.component.html'
})
export class ImageComparisonComponent implements AfterViewInit {
    @Input() beforeImage: string = '';
    @Input() afterImage: string = '';

    @ViewChild('container', { static: true }) container!: ElementRef;
    @ViewChild('overlay', { static: true }) overlay!: ElementRef;
    @ViewChild('slider', { static: true }) slider!: ElementRef;
    @ViewChild('wrapper', { static: true }) wrapper!: ElementRef;

    private isDragging: boolean = false;
    private imageWidth: number = 0;
    private imageHeight: number = 0;

    ngAfterViewInit(): void {
        this.addEventListeners();
    }

    private addEventListeners(): void {
        const wrapper = this.wrapper.nativeElement;

        // Mouse events
        wrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Touch events
        wrapper.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Click events
        wrapper.addEventListener('click', this.onClick.bind(this));

        const imageBefore = wrapper.querySelector('.image-before-container').querySelector('img');
        imageBefore.addEventListener('load', this.onImageLoad.bind(this));
    }

    @HostListener('window:resize', ['$event'])
    private onResize(): void {
        if (!this.imageWidth || !this.imageHeight || !this.wrapper) {
            return;
        }
        const wrapper = this.wrapper.nativeElement;
        const imageAspect = this.imageWidth / this.imageHeight;
        const containerWidth = wrapper.offsetWidth;
        const containerHeight = Math.floor(containerWidth / imageAspect);

        wrapper.querySelector('.image-container').style.height = `${containerHeight}px`;
    }

    private onImageLoad(e: Event): void {
        const img = e.target as HTMLImageElement;
        this.imageWidth = img.naturalWidth;
        this.imageHeight = img.naturalHeight;
        this.onResize();
    }

    private onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.isDragging = true;
        this.updateSliderPosition(event.clientX);
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.isDragging) {
            event.preventDefault();
            this.updateSliderPosition(event.clientX);
        }
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private onTouchStart(event: TouchEvent): void {
        event.preventDefault();
        this.isDragging = true;
        this.updateSliderPosition(event.touches[0].clientX);
    }

    private onTouchMove(event: TouchEvent): void {
        if (this.isDragging) {
            event.preventDefault();
            this.updateSliderPosition(event.touches[0].clientX);
        }
    }

    private onTouchEnd(): void {
        this.isDragging = false;
    }

    private onClick(event: MouseEvent): void {
        if (!this.isDragging) {
            this.updateSliderPosition(event.clientX);
        }
    }

    private updateSliderPosition(clientX: number): void {
        if (!this.container || !this.overlay || !this.slider) {
            return;
        }
        const rect = this.container.nativeElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        this.overlay.nativeElement.style.width = `${percentage}%`;
        this.slider.nativeElement.style.left = `${percentage}%`;
    }
}
