import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';

@Component({
    selector: 'app-user-session',
    templateUrl: './templates/auth-session.component.html',
    providers: [UserService]
})
export class AuthSessionComponent implements OnInit, OnDestroy {

    loading = true;
    activated = false;
    message = '';
    messageType = 'error';
    user: User;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
    }

    ngOnInit(): void {
        this.activateUser();
    }

    activateUser(): void {
        this.authService.userGetToken()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.tokenStorageService.saveToken(res.access);
                    this.tokenStorageService.saveRefreshToken(res.refresh);
                    this.getCurrentUser();
                },
                error: (err) => {
                    // console.log(err);
                    this.messageType = 'error';
                    if (err?.error?.detail) {
                        this.message = err?.error?.detail;
                    } else {
                        this.message = $localize `Error. Please try again later or contact support.`;
                    }
                    this.loading = false;
                }
            });
    }

    getCurrentUser(): void {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.user = res;
                    this.tokenStorageService.saveUser(this.user);
                    this.authService.userSubject.next(this.user);
                    this.loading = false;
                    this.navigateHomePage();
                },
                error: (err) => {
                    this.messageType = 'error';
                    this.message = err?.error?.detail;
                    this.loading = false;
                }
            });
    }

    private navigateHomePage(): void {
        this.router.navigate(['/']);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
