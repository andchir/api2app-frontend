import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from "@angular/router";

import { debounceTime, Subject } from 'rxjs';

@Component({
    selector: 'app-apis-list',
    templateUrl: './list.component.html',
    styleUrls: [],
    providers: []
})
export class ListApisComponent implements OnInit {

    searchWord$ = new Subject<string>();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.searchWord$
            .pipe(debounceTime(700))
            .subscribe((value) => this.onSearchUpdate(value));
    }

    onSearchKeyUp(event: Event|KeyboardEvent): void {
        this.searchWord$.next((event.target as HTMLInputElement).value);
    }

    onSearchUpdate(searchWord: string): void {
        const queryParams: Params = {search: searchWord || null};
        this.router.navigate(
            [],
            {
                relativeTo: this.activatedRoute,
                queryParams,
                queryParamsHandling: 'merge'
            }
        );
    }
}
