import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'toHtml' })
export class ToHtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {}

    transform(text: string): SafeHtml {
        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 2);
        }
        if (typeof text !== 'string') {
            return text;
        }

        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig;
        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/ig;
        const imageExtRegex = /\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?[^"']*)?$/i;

        const linkClass = 'inline-block align-bottom max-w-full whitespace-nowrap overflow-hidden text-ellipsis app-text-link';
        const imgClass = 'rounded-lg max-w-full xs:max-w-64 mt-1 block';

        // URL/email detection must happen on the original text BEFORE HTML escaping,
        // otherwise escaped quotes (&quot;) bleed into the matched URL.
        const combinedRegex = new RegExp(`(${urlRegex.source}|${emailRegex.source})`, 'ig');

        let result = '';
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = combinedRegex.exec(text)) !== null) {
            result += this.escapeHtml(text.slice(lastIndex, match.index));

            const value = match[0];

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

            lastIndex = match.index + value.length;
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
