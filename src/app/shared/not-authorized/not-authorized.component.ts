import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
    selector: 'app-not-authorized',
    templateUrl: './not-authorized.component.html'
})
export class NotAuthorizedComponent implements OnInit {

    constructor(
        private authService: AuthService
    ) {}

    ngOnInit(): void {

    }

    navigateLogin(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        this.authService.navigateLogin();
    }

    navigateRegister(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        this.authService.navigateAuthPage('register');
    }
}
