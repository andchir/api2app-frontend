import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { initFlowbite } from 'flowbite';

import { TokenStorageService } from "./services/token-storage.service";
import { AuthService } from './services/auth.service';
import { User } from './apis/models/user.interface';
import {filter} from "rxjs/operators";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    userSubject$: BehaviorSubject<User>;
    isLoggedIn = false;
    isMobileMenuActive = false;

    constructor(
        private router: Router,
        private tokenStorageService: TokenStorageService,
        private authService: AuthService
    ) {
        this.userSubject$ = this.authService.userSubject;
        router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((e) => {
                // initFlowbite();
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
