import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    OnDestroy,
    output,
    signal,
    viewChild
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicationService } from '../../../../services/application.service';

@Component({
    selector: 'app-element-iframe',
    templateUrl: 'element-iframe.component.html',
    imports: [
        NgStyle,
        NgClass
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementIframeComponent implements OnDestroy {

    readonly editorMode = input(false);
    readonly pageUrl = input('');
    readonly htmlContent = input('');
    readonly height = input(600);
    readonly useResizer = input(false);
    readonly useRefreshButton = input(false);
    readonly useFullscreenButton = input(false);
    readonly border = input(false);
    readonly hiddenByDefault = input(false);
    readonly refreshContent = output<HTMLIFrameElement>();

    readonly iframeEl = viewChild<ElementRef<HTMLIFrameElement>>('iframeEl');
    readonly iframeContainer = viewChild<ElementRef<HTMLElement>>('iframeContainer');

    readonly safeHtmlContent = computed<SafeHtml | null>(() => {
        if (!this.htmlContent()) {
            return null;
        }

        let htmlContent = this.htmlContent();
        const tags = ApplicationService.findStringTags(htmlContent, true);
        tags.forEach((tagName) => {
            htmlContent = htmlContent.replace(`{${tagName}}`, '');
        });

        return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
    });
    readonly safeUrl = computed<SafeResourceUrl>(() =>
        this.sanitizer.bypassSecurityTrustResourceUrl(this.pageUrl() || 'about:blank')
    );
    readonly iframeWidth = signal(100);
    readonly isResizing = signal(false);
    readonly isFullScreenMode = signal(false);
    readonly areFullScreenControlsOnLeft = signal(false);
    private readonly windowHeight = signal(typeof window === 'undefined' ? 600 : window.innerHeight);
    readonly heightCurrent = computed(() =>
        this.isFullScreenMode() ? this.windowHeight() : this.height()
    );

    private pageOverflowBeforeScrollLock?: {body: string, documentElement: string};
    private startX: number = 0;
    private startWidth: number = 0;
    private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
    private mouseUpListener: ((e: MouseEvent) => void) | null = null;
    private touchMoveListener: ((e: TouchEvent) => void) | null = null;
    private touchEndListener: ((e: TouchEvent) => void) | null = null;

    constructor(private sanitizer: DomSanitizer) {}

    onMouseDown(event: MouseEvent): void {
        if (!this.useResizer() || this.editorMode()) {
            return;
        }
        this.isResizing.set(true);
        this.startX = event.clientX;
        this.startWidth = this.iframeWidth();

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
        if (!this.isResizing()) {
            return;
        }

        const container = this.iframeContainer()?.nativeElement;
        if (!container) {
            return;
        }

        const containerWidth = container.clientWidth;
        const clientX = this.getPositionX(event);
        const deltaX = clientX - this.startX;
        const newWidthPercent = this.startWidth + (deltaX * 2 / containerWidth * 100);

        // Limit width between 20% and 100%
        this.iframeWidth.set(Math.max(20, Math.min(100, newWidthPercent)));
    }

    private onMouseUp(event: MouseEvent): void {
        this.onEnd();
    }

    private onEnd(): void {
        this.isResizing.set(false);

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
    }

    onTouchStart(event: TouchEvent): void {
        if (!this.useResizer() || this.editorMode()) {
            return;
        }
        this.isResizing.set(true);
        this.startX = this.getPositionX(event);
        this.startWidth = this.iframeWidth();

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
        const iframe = this.iframeEl()?.nativeElement;
        if (this.editorMode() || !iframe) {
            return;
        }
        this.refreshContent.emit(iframe);
    }

    fullScreenToggle(): void {
        if (this.editorMode()) {
            return;
        }
        this.isFullScreenMode.update((isFullScreenMode) => !isFullScreenMode);
        if (this.isFullScreenMode()) {
            this.disablePageScroll();
        } else {
            this.restorePageScroll();
        }
        this.onResize();
    }

    toggleFullScreenControlsPosition(): void {
        if (this.editorMode() || !this.isFullScreenMode()) {
            return;
        }
        this.areFullScreenControlsOnLeft.update((controlsOnLeft) => !controlsOnLeft);
    }

    onResize(): void {
        if (typeof window !== 'undefined') {
            this.windowHeight.set(window.innerHeight);
        }
    }

    private disablePageScroll(): void {
        if (this.pageOverflowBeforeScrollLock) {
            return;
        }
        this.pageOverflowBeforeScrollLock = {
            body: document.body.style.overflow,
            documentElement: document.documentElement.style.overflow
        };
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    private restorePageScroll(): void {
        if (!this.pageOverflowBeforeScrollLock) {
            return;
        }
        document.body.style.overflow = this.pageOverflowBeforeScrollLock.body;
        document.documentElement.style.overflow = this.pageOverflowBeforeScrollLock.documentElement;
        this.pageOverflowBeforeScrollLock = undefined;
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
        this.restorePageScroll();
    }
}
