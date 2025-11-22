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
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
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

    private onMouseMove(event: MouseEvent): void {
        if (!this.isResizing) {
            return;
        }

        const container = document.querySelector('.iframe-container');
        if (!container) {
            return;
        }

        const containerWidth = container.clientWidth;
        const deltaX = event.clientX - this.startX;
        const newWidthPercent = this.startWidth + (deltaX / containerWidth * 100);

        // Limit width between 20% and 100%
        this.iframeWidth = Math.max(20, Math.min(100, newWidthPercent));
        this.cdr.detectChanges();
    }

    private onMouseUp(event: MouseEvent): void {
        this.isResizing = false;

        if (this.mouseMoveListener) {
            document.removeEventListener('mousemove', this.mouseMoveListener);
            this.mouseMoveListener = null;
        }
        if (this.mouseUpListener) {
            document.removeEventListener('mouseup', this.mouseUpListener);
            this.mouseUpListener = null;
        }
        this.cdr.detectChanges();
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
    }
}
