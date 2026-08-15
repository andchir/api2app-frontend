import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

const APP_NAME = environment.appName;

@Injectable({providedIn: 'root'})
export class CustomTitleStrategy extends TitleStrategy {
    constructor(private readonly title: Title) {
        super();
    }

    override updateTitle(routerState: RouterStateSnapshot) {
        const title = this.buildTitle(routerState);
        if (title !== undefined) {
            this.title.setTitle(`${APP_NAME} - ${title}`);
        } else {
            this.title.setTitle(APP_NAME);
        }
    }
}
