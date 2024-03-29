import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-auth-logout',
    template: '',
    styleUrls: [],
    providers: [UserService]
})
export class AuthLogoutComponent implements OnInit {

    constructor(
        private router: Router,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService
    ) {
    }

    ngOnInit(): void {
        this.tokenStorageService.signOut();
        this.navigateBack();
    }

    private navigateBack(): void {
        setTimeout(() => {
            this.authService.userSubject.next(null);
        }, 1);
        this.authService.navigateBack();
    }
}
