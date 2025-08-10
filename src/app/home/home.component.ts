import { Component, Inject, LOCALE_ID, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent implements OnInit {

    @ViewChild('enTemplate', { static: true }) enTemplate!: TemplateRef<any>;
    @ViewChild('ruTemplate', { static: true }) ruTemplate!: TemplateRef<any>;
    @ViewChild('frTemplate', { static: true }) frTemplate!: TemplateRef<any>;
    @ViewChild('deTemplate', { static: true }) deTemplate!: TemplateRef<any>;
    @ViewChild('esTemplate', { static: true }) esTemplate!: TemplateRef<any>;
    @ViewChild('ukTemplate', { static: true }) ukTemplate!: TemplateRef<any>;

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private authService: AuthService
    ) {}

    getTemplate(): TemplateRef<any> {
        switch (this.locale) {
            case 'ru':
                return this.ruTemplate;
            case 'fr':
                return this.frTemplate;
            case 'de':
                return this.deTemplate;
            case 'es':
                return this.esTemplate;
            case 'uk':
                return this.ukTemplate;
        }
        return this.enTemplate;
    }

    ngOnInit(): void {
        const redirectRoute = this.authService.getNextRoute(true);
        if (redirectRoute) {
            this.authService.navigateRoute(redirectRoute);
        }
    }
}
