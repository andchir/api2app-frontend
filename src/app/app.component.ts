import { Component, OnInit } from '@angular/core';

import { initFlowbite } from 'flowbite';
import { TokenStorageService } from "./services/token-storage.service";
import { User } from './apis/models/user.interface';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    user: User;
    isLoggedIn = false;

    constructor(
        private tokenStorageService: TokenStorageService
    ) { }

    ngOnInit(): void {
        initFlowbite();

        this.isLoggedIn = !!this.tokenStorageService.getToken();

        if (this.isLoggedIn) {
            this.user = this.tokenStorageService.getUser();
        }
    }

    navigateLogout(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        this.tokenStorageService.navigateLogout();
    }
}
