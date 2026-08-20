import {Component, input, model, output, signal} from '@angular/core';

@Component({
    selector: 'app-share-item',
    templateUrl: './share-item.component.html',
    standalone: false
})
export class ShareItemComponent {

    readonly modalTitle = input('Share Item');
    readonly loading = input(false);
    readonly isActive = model(false);
    readonly isShared = model(false);
    readonly isHidden = model(false);
    readonly readOnly = input(false);
    readonly itemUuid = input('');
    readonly language = input('en');
    readonly itemEmbedUuid = input('');
    readonly shareUrl = input('/item/shared/');
    readonly confirmed = output<boolean>();
    readonly activeTab = signal<'link'|'iframe'>('link');
    readonly message = signal('');

    get baseUrl(): string {
        return `${window.location.protocol}//${window.location.host}`;
    }

    get publicUrl(): string {
        return `${this.baseUrl}/${this.language()}${this.shareUrl()}${this.itemUuid()}`;
    }

    get embedUrl(): string {
        const embedPath = this.shareUrl().replace('/shared/', '/embed/');
        return `${this.baseUrl}/${this.language()}${embedPath}${this.itemEmbedUuid()}`;
    }

    get iframeCode(): string {
        return `<iframe src="${this.embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
    }

    closeModal(): void {
        this.message.set('');
        this.activeTab.set('link');
        this.isActive.set(false);
    }

    switchTab(tab: 'link'|'iframe'): void {
        if (this.loading()) {
            return;
        }
        this.activeTab.set(tab);
        this.message.set('');
    }

    onChangeHidden(): void {
        this.isHidden.update(value => !value);
    }

    makeSharedToggle(): void {
        this.message.set('');
        this.confirmed.emit(!this.isShared());
    }

    openUrl(input: HTMLInputElement): void {
        window.open(String(input.value), '_blank').focus();
    }

    copyUrl(input: HTMLInputElement): void {
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        this.message.set($localize `The URL has been successfully copied to the clipboard.`);
    }

    copyIframeCode(textarea: HTMLTextAreaElement): void {
        textarea.select();
        navigator.clipboard.writeText(textarea.value);
        this.message.set($localize `:@@ShareItemIframeCodeCopied:The iframe code has been successfully copied to the clipboard.`);
    }
}
