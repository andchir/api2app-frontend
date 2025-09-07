import {
    Component,
    Input,
    AfterViewInit,
    ViewChild,
    ElementRef,
    HostListener,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-comparison',
    standalone: true,
    imports: [CommonModule],
    templateUrl: 'image-comparison.component.html'
})
export class ImageComparisonComponent implements AfterViewInit, OnChanges {
    @Input() beforeImage: string = '';
    @Input() afterImage: string = '';
    @Input() hidden: boolean = false;

    @ViewChild('container', { static: true }) container!: ElementRef;
    @ViewChild('overlay', { static: true }) overlay!: ElementRef;
    @ViewChild('slider', { static: true }) slider!: ElementRef;
    @ViewChild('wrapper', { static: true }) wrapper!: ElementRef;

    maxWidth: number = 800;
    maxHeight: number = 600;
    isFullScreenMode: boolean = false;
    private isDragging: boolean = false;
    private imageWidth: number = 0;
    private imageHeight: number = 0;

    ngAfterViewInit(): void {
        this.addEventListeners();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['hidden']) {
            this.onResize();
        }
    }

    private addEventListeners(): void {
        const wrapper = this.wrapper.nativeElement;

        // Mouse events
        wrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
        wrapper.addEventListener('mousemove', this.onMouseMove.bind(this));
        wrapper.addEventListener('mouseup', this.onMouseUp.bind(this));
        wrapper.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        // Touch events
        wrapper.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        wrapper.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        wrapper.addEventListener('touchend', this.onTouchEnd.bind(this));

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
        const container = this.container.nativeElement;
        const wrapper = this.wrapper.nativeElement;
        const imageAspect = this.imageWidth / this.imageHeight;
        container.style.paddingTop = null;

        if (this.isFullScreenMode) {
            container.parentNode.style.height = `${container.offsetHeight}px`;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const windowAspect = windowWidth / windowHeight;
            if (windowAspect > imageAspect) {
                const containerWidth = windowHeight * imageAspect;
                wrapper.style.width = `${containerWidth}px`;
                wrapper.querySelector('.image-container').style.height = `${windowHeight}px`;
            } else {
                const containerHeight = windowWidth / imageAspect;
                const paddingY = (windowHeight - containerHeight) / 2;
                wrapper.style.width = `${windowWidth}px`;
                container.style.paddingTop = `${paddingY}px`;
                wrapper.querySelector('.image-container').style.height = `${containerHeight}px`;
            }
        } else {
            const containerWidth = Math.min(this.maxWidth, container.parentNode.offsetWidth);
            const wrapperWidth = (containerWidth / imageAspect) <= this.maxHeight
                ? containerWidth
                : this.maxHeight * imageAspect;
            const containerHeight = Math.floor(wrapperWidth / imageAspect);
            wrapper.style.width = `${wrapperWidth}px`;
            wrapper.querySelector('.image-container').style.height = `${containerHeight}px`;
            container.parentNode.style.height = `${containerHeight}px`;
        }
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
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.isDragging) {
            event.preventDefault();
            this.updateSliderPosition(event.clientX);
        }
    }

    private onMouseLeave(event: MouseEvent): void {
        this.isDragging = false;
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private onTouchStart(event: TouchEvent): void {
        this.isDragging = true;
    }

    private onTouchMove(event: TouchEvent): void {
        if (this.isDragging) {
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
        const rect = this.wrapper.nativeElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        this.overlay.nativeElement.style.width = `${percentage}%`;
        this.slider.nativeElement.style.left = `${percentage}%`;
    }

    fullScreenToggle(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        // if (!document.fullscreenElement) {
        //     this.container.nativeElement.requestFullscreen()
        //         .then(() => {
        //             this.isFullScreenMode = true;
        //         })
        //         .catch((e: any) => {
        //             console.log(e);
        //         });
        // } else {
        //     document.exitFullscreen()
        //         .then(() => {
        //             this.isFullScreenMode = false;
        //         })
        // }
        this.isFullScreenMode = !this.isFullScreenMode;
        this.onResize();
    }
}
