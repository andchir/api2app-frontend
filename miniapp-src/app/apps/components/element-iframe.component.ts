import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter,
    Input, OnChanges,
    OnDestroy,
    OnInit, Output, SimpleChanges,
    ViewChild
} from '@angular/core';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicationService } from '../../services/application.service';

@Component({
    selector: 'app-element-iframe',
    templateUrl: 'element-iframe.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgStyle,
        NgClass
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementIframeComponent implements OnInit, OnDestroy, OnChanges {

    @Input() editorMode = false;
    @Input() pageUrl: string = '';
    @Input() htmlContent: string = '';
    @Input() height: number = 600;
    @Input() useResizer: boolean = false;
    @Input() useRefreshButton: boolean = false;
    @Input() useFullscreenButton: boolean = false;
    @Input() border: boolean = false;
    @Input() hiddenByDefault: boolean = false;
    @Output() refreshContent: EventEmitter<HTMLIFrameElement> = new EventEmitter<HTMLIFrameElement>();

    @ViewChild('iframeEl', { static: false }) iframeEl!: ElementRef;
    @ViewChild('iframeContainer', { static: false }) iframeContainer!: ElementRef;
    @ViewChild('resizerHandle', { static: false }) resizerHandle!: ElementRef;

    safeHtmlContent: SafeHtml | null = null;
    safeUrl: SafeResourceUrl | null = 'about:blank';
    iframeWidth: number = 100;
    heightCurrent: number = 600;
    isResizing: boolean = false;
    isFullScreenMode: boolean = false;
    private startX: number = 0;
    private startWidth: number = 0;
    private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
    private mouseUpListener: ((e: MouseEvent) => void) | null = null;
    private touchMoveListener: ((e: TouchEvent) => void) | null = null;
    private touchEndListener: ((e: TouchEvent) => void) | null = null;

    constructor(
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.heightCurrent = this.height;
        this.createSafeUrl();
        this.createIframeContent();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pageUrl']) {
            this.createSafeUrl();
        }
    }

    createSafeUrl(): void {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pageUrl || 'about:blank');
        this.cdr.detectChanges();
    }

    createIframeContent(): void {
        if (!this.htmlContent) {
            return;
        }
        let htmlContent = this.htmlContent;
        const tags = ApplicationService.findStringTags(htmlContent);
        tags.forEach((tagName) => {
            htmlContent = htmlContent.replace(`{${tagName}}`, '');
        });

        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
        this.cdr.detectChanges();
    }

    onMouseDown(event: MouseEvent): void {
        if (!this.useResizer || this.editorMode) {
            return;
        }
        this.isResizing = true;
        this.startX = event.clientX;
        this.startWidth = this.iframeWidth;

        this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
        this.mouseUpListener = (e: MouseEvent) => this.onMouseUp(e);

        document.addEventListener('mousemove', this.mouseMoveListener);
        document.addEventListener('mouseup', this.mouseUpListener);

        event.preventDefault();
    }

    private getPositionX(event: MouseEvent | TouchEvent): number {
        return event.type.includes('mouse')
            ? (event as MouseEvent).clientX
            : (event as TouchEvent).touches[0].clientX;
    }

    private onMouseMove(event: MouseEvent): void {
        this.onMove(event);
    }

    private onMove(event: MouseEvent | TouchEvent): void {
        if (!this.isResizing) {
            return;
        }

        const container = this.iframeContainer?.nativeElement;
        if (!container) {
            return;
        }

        const containerWidth = container.clientWidth;
        const clientX = this.getPositionX(event);
        const deltaX = clientX - this.startX;
        const newWidthPercent = this.startWidth + (deltaX * 2 / containerWidth * 100);

        // Limit width between 20% and 100%
        this.iframeWidth = Math.max(20, Math.min(100, newWidthPercent));
        this.cdr.detectChanges();
    }

    private onMouseUp(event: MouseEvent): void {
        this.onEnd();
    }

    private onEnd(): void {
        this.isResizing = false;

        if (this.mouseMoveListener) {
            document.removeEventListener('mousemove', this.mouseMoveListener);
            this.mouseMoveListener = null;
        }
        if (this.mouseUpListener) {
            document.removeEventListener('mouseup', this.mouseUpListener);
            this.mouseUpListener = null;
        }
        if (this.touchMoveListener) {
            document.removeEventListener('touchmove', this.touchMoveListener);
            this.touchMoveListener = null;
        }
        if (this.touchEndListener) {
            document.removeEventListener('touchend', this.touchEndListener);
            this.touchEndListener = null;
        }
        this.cdr.detectChanges();
    }

    onTouchStart(event: TouchEvent): void {
        if (!this.useResizer || this.editorMode) {
            return;
        }
        this.isResizing = true;
        this.startX = this.getPositionX(event);
        this.startWidth = this.iframeWidth;

        this.touchMoveListener = (e: TouchEvent) => this.onTouchMove(e);
        this.touchEndListener = (e: TouchEvent) => this.onTouchEnd(e);

        document.addEventListener('touchmove', this.touchMoveListener, { passive: false });
        document.addEventListener('touchend', this.touchEndListener);

        event.preventDefault();
    }

    private onTouchMove(event: TouchEvent): void {
        this.onMove(event);
        event.preventDefault();
    }

    private onTouchEnd(event: TouchEvent): void {
        this.onEnd();
    }

    refreshContentAction(): void {
        if (this.editorMode || !this.iframeEl?.nativeElement) {
            return;
        }
        this.refreshContent.emit(this.iframeEl?.nativeElement);
    }

    fullScreenToggle(): void {
        if (this.editorMode) {
            return;
        }
        this.isFullScreenMode = !this.isFullScreenMode;
        this.onResize();
    }

    onResize(): void {
        const windowHeight = window.innerHeight;
        if (this.isFullScreenMode) {
            this.heightCurrent = windowHeight;
        } else {
            this.heightCurrent = this.height;
        }
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.mouseMoveListener) {
            document.removeEventListener('mousemove', this.mouseMoveListener);
        }
        if (this.mouseUpListener) {
            document.removeEventListener('mouseup', this.mouseUpListener);
        }
        if (this.touchMoveListener) {
            document.removeEventListener('touchmove', this.touchMoveListener);
        }
        if (this.touchEndListener) {
            document.removeEventListener('touchend', this.touchEndListener);
        }
    }
}
