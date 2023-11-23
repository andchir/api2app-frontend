import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-logout',
    template: '',
    styleUrls: [],
    providers: [UserService]
})
export class AuthLogoutComponent implements OnInit {

    constructor(
        private router: Router,
        private tokenStorageService: TokenStorageService
    ) {
    }

    ngOnInit(): void {
        this.tokenStorageService.signOut();
        this.navigateBack();
    }

    private navigateBack(): void {
        const nextRoute = this.tokenStorageService.getNextRoute();
        this.router.navigate(nextRoute ? [nextRoute] : ['/']);
    }
}
