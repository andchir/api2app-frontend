import { Component, OnInit } from '@angular/core';

import { initFlowbite } from 'flowbite';
import { TokenStorageService } from "./services/token-storage.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    private groups: string[] = [];
    isLoggedIn = false;
    username?: string;

    constructor(
        private tokenStorageService: TokenStorageService
    ) { }

    ngOnInit(): void {
        initFlowbite();

        this.isLoggedIn = !!this.tokenStorageService.getToken();

        if (this.isLoggedIn) {
            const user = this.tokenStorageService.getUser();
            this.groups = user?.groups;
            this.username = user?.username;
        }

        console.log('isLoggedIn', this.isLoggedIn);
    }

    logout(): void {
        this.tokenStorageService.signOut();
        this.isLoggedIn = false;
        this.groups = [];
    }
}
