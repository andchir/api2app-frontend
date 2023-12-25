import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { User } from '../apis/models/user.interface';

@Component({
    selector: 'app-user-activate',
    templateUrl: './templates/auth-activate.component.html',
    providers: [UserService]
})
export class AuthUserActivateComponent implements OnInit, OnDestroy {

    loading = true;
    activated = false;
    message = '';
    messageType = 'error';
    user: User;
    destroyed$: Subject<void> = new Subject();

    form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService,
        private userService: UserService
    ) {
    }

    ngOnInit(): void {
        this.activateUser();
    }

    activateUser(): void {
        const uid = this.route.snapshot.paramMap.get('uid');
        const token = this.route.snapshot.paramMap.get('token');
        this.authService.activateUser(uid, token)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.activated = true;
                },
                error: (err) => {
                    // console.log(err);
                    this.messageType = 'error';
                    if (err?.error?.detail) {
                        this.message = err?.error?.detail;
                    } else {
                        this.message = 'Error. Please try again later or contact support.';
                    }
                    this.loading = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
