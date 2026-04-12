import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'toHtml' })
export class ToHtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {}

    transform(text: string): SafeHtml {
        if (text === null) {
            text = '';
        }
        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 2);
        }
        if (typeof text === 'number') {
            text = String(text);
        }
        if (typeof text !== 'string' || !text) {
            return '';
        }

        const urlRegex = /https?:\/\/[^\s<>"'`]+/i;
        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i;
        const imageExtRegex = /\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?[^\s"']*)?$/i;
        const trailingPunct = /[.,;:!?)\]]+$/;

        const linkClass = 'inline-block align-bottom max-w-full whitespace-nowrap overflow-hidden text-ellipsis app-text-link';
        const imgClass = 'rounded-lg max-w-full w-64 mt-1 block';

        // URL/email detection must happen on the original text BEFORE HTML escaping,
        // otherwise escaped quotes (&quot;) bleed into the matched URL.
        const combinedRegex = new RegExp(`(${urlRegex.source}|${emailRegex.source})`, 'ig');

        let result = '';
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = combinedRegex.exec(text)) !== null) {
            result += this.escapeHtml(text.slice(lastIndex, match.index));

            const raw = match[0];
            const value = /^https?:\/\//i.test(raw) ? raw.replace(trailingPunct, '') : raw;
            const tail = raw.slice(value.length);

            if (/^https?:\/\//i.test(value)) {
                const target = value.includes('#') ? '_self' : '_blank';
                const safeHref = this.escapeHtml(value);
                if (imageExtRegex.test(value)) {
                    result += `<a class="${linkClass.replace('inline-block', 'block')}" rel="nofollow noopener noreferrer" href="${safeHref}" target="${target}">` +
                        `<img class="${imgClass}" src="${safeHref}" alt="" /></a>`;
                } else {
                    result += `<a class="${linkClass}" rel="nofollow noopener noreferrer" href="${safeHref}" target="${target}">${safeHref}</a>`;
                }
            } else {
                const safeValue = this.escapeHtml(value);
                result += `<a class="${linkClass}" href="mailto:${safeValue}">${safeValue}</a>`;
            }

            result += this.escapeHtml(tail);
            lastIndex = match.index + raw.length;
        }

        result += this.escapeHtml(text.slice(lastIndex));

        return this.sanitizer.bypassSecurityTrustHtml(result);
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
