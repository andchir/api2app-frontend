import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';

import { TokenStorageService } from './services/token-storage.service';
import { AuthService } from './services/auth.service';
import { User } from './apis/models/user.interface';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    userSubject$: BehaviorSubject<User>;
    isLoggedIn = false;
    isMobileMenuActive = false;
    isSharedPageUrl = false;
    isPersonalPageUrl = false;
    navigationLoading = false;

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private router: Router,
        private tokenStorageService: TokenStorageService,
        private authService: AuthService
    ) {
        this.userSubject$ = this.authService.userSubject;
        this.isSharedPageUrl = window.location.href.includes('/shared/') || window.location.href.includes('/embed/');
        router.events
            .subscribe((e) => {
                if (e instanceof NavigationStart) {
                    this.navigationLoading = true;
                }
                if (e instanceof NavigationEnd) {
                    // initFlowbite();
                    this.isSharedPageUrl = e.url.includes('/shared/') || e.url.includes('/embed/');
                    this.isPersonalPageUrl = e.url.includes('/apps/personal') || e.url.includes('/apis/personal');
                    this.navigationLoading = false;
                    this.isMobileMenuActive = false;
                }
            });
    }

    ngOnInit(): void {
        // initFlowbite();
        this.isLoggedIn = !!this.tokenStorageService.getToken();

        if (this.isLoggedIn) {
            this.userSubject$.next(this.tokenStorageService.getUser());
        }
    }

    navigateLogout(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        this.authService.navigateLogout();
    }

    mobileMenuToggle(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        this.isMobileMenuActive = !this.isMobileMenuActive;
    }
}
