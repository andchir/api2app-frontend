import {Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-auth-logout',
    template: '',
    styleUrls: [],
    providers: [UserService]
})
export class AuthLogoutComponent implements OnInit, OnDestroy {

    destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService
    ) {
    }

    ngOnInit(): void {
        this.tokenStorageService.signOut();

        this.authService.userSessionDelete()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.navigateBack();
                },
                error: (err) => {
                    // console.log(err);
                    this.navigateBack();
                }
            });
    }

    private navigateBack(): void {
        setTimeout(() => {
            this.authService.userSubject.next(null);
        }, 1);
        this.authService.navigateBack();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
