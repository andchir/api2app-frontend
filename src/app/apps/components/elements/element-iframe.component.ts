import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
export class ElementIframeComponent implements OnInit, OnDestroy {

    @Input() editorMode = false;
    @Input() pageUrl: string = '';
    @Input() height: number = 600;
    @Input() useResizer: boolean = false;
    @Input() border: boolean = false;

    @ViewChild('resizerHandle', { static: false }) resizerHandle: ElementRef;

    safeUrl: SafeResourceUrl | null = null;
    iframeWidth: number = 100;
    isResizing: boolean = false;
    private startX: number = 0;
    private startWidth: number = 0;
    private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
    private mouseUpListener: ((e: MouseEvent) => void) | null = null;

    constructor(
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        if (this.pageUrl) {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pageUrl);
        }
        if (this.editorMode) {
            this.pageUrl = 'https://example.com';
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pageUrl);
        }
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
