import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    isLoggedIn = false;
    isMobileMenuActive = false;
    isSharedPageUrl = false;
    isPersonalPageUrl = false;
    navigationLoading = false;

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
    ) {
        router.events
            .subscribe((e) => {
                if (e instanceof NavigationStart) {
                    this.navigationLoading = true;
                }
                if (e instanceof NavigationEnd) {
                    // initFlowbite();
                    this.isSharedPageUrl = e.url.includes('/shared/');
                    this.isPersonalPageUrl = e.url.includes('/apps/personal') || e.url.includes('/apis/personal');
                    this.navigationLoading = false;
                }
            });
    }

    ngOnInit(): void {
        // initFlowbite();
    }

    mobileMenuToggle(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        this.isMobileMenuActive = !this.isMobileMenuActive;
    }
}
