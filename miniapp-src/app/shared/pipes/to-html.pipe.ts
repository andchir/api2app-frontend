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

        text = this.escapeHtml(text);

        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig;
        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/ig;

        const linkClass = 'inline-block align-bottom max-w-full whitespace-nowrap overflow-hidden text-ellipsis app-text-link';

        text = text.replace(emailRegex, (value) =>
            `<a class="${linkClass}" href="mailto:${value}">${value}</a>`
        );
        text = text.replace(urlRegex, (value) => {
            const target = value.includes('#') ? '_self' : '_blank';
            return `<a class="${linkClass}" rel="nofollow noopener noreferrer" href="${value}" target="${target}">${value}</a>`;
        });

        return this.sanitizer.bypassSecurityTrustHtml(text);
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
