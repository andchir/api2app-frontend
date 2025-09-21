import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterEventsService {

    private previousUrl: string = '';
    private currentUrl: string = '';

    constructor(
        private router : Router
    ) {
        this.currentUrl = this.router.url.split('?')[0];
        router.events
            .subscribe(event => {
                if (event instanceof NavigationEnd) {
                    if (this.currentUrl !== event.url.split('?')[0] || event.url.includes('?search=')) {
                        this.previousUrl = this.currentUrl;
                        this.currentUrl = event.url;
                    }
                }
            });
    }

    public getPreviousUrl(withoutQueryParams: boolean = false){
        if (withoutQueryParams) {
            return this.previousUrl.split('?')[0];
        }
        return this.previousUrl;
    }

    public getCurrentUrl(withoutQueryParams: boolean = false) {
        if (withoutQueryParams) {
            return this.currentUrl.split('?')[0];
        }
        return this.currentUrl;
    }

    public getPreviousQueryParams(): any {
        return this.getQueryParams(this.getPreviousUrl());
    }

    getQueryParams(url: string): any {
        const result = {};
        const parts = url.split('?');
        if (parts.length < 2) {
            return result;
        }
        const queryString = parts[1];
        const params = queryString.split('&');
        for (const param of params) {
            const [key, value] = param.split('=');
            if (key) {
                const decodedKey = decodeURIComponent(key);
                result[decodedKey] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            }
        }
        return result;
    }
}
