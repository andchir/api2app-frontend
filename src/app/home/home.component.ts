import {Component, Inject, LOCALE_ID} from '@angular/core';
import {Router} from "@angular/router";
import {TokenStorageService} from "../services/token-storage.service";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent {
    constructor(
        @Inject(LOCALE_ID) public locale: string
    ) {}
}
