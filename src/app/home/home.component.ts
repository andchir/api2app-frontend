import {Component, Inject, LOCALE_ID} from '@angular/core';

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
