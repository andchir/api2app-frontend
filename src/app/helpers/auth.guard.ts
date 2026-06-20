import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService,
        private tokenStorageService: TokenStorageService
    ) {
    }

    canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        if (this.tokenStorageService.getToken()) {
            return true;
        }

        this.authService.saveNextRoute(state.url);
        return this.router.createUrlTree(['/auth', 'login']);
    }
}
