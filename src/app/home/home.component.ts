import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent implements OnInit {
    constructor(
        @Inject(LOCALE_ID) public locale: string,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        const redirectRoute = this.authService.getNextRoute(true);
        if (redirectRoute) {
            this.authService.navigateRoute(redirectRoute);
        }
    }
}
