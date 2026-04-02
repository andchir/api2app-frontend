import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toHtml'
})
export class ToHtmlPipe implements PipeTransform {
    transform(text: string): any {
        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 2);
        }
        if (typeof text !== 'string') {
            return text;
        }
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig;
        const emailRegex = /[^\s]+@[^\s.]+\.[^\s]+/ig;
        text = text.replace(emailRegex, (value) => {
            return `<a class="inline-block align-bottom max-w-full whitespace-nowrap overflow-hidden text-ellipsis app-text-link" href="mailto:${value}">${value}</a>`;
        });
        text = text.replace(urlRegex, (value) => {
            const target = value.includes('#') ? '_self' : '_blank';
            return `<a class="inline-block align-bottom max-w-full whitespace-nowrap overflow-hidden text-ellipsis app-text-link" rel="nofollow" href="${value}" target="${target}">${value}</a>`;
        });

        return text;
    }
}
