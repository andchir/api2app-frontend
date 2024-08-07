import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { debounceTime, delay, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { RouterEventsService } from '../../services/router-events.service';

@Component({
    selector: 'app-apis-list',
    templateUrl: './list.component.html',
    styleUrls: [],
    providers: []
})
export class ListApisComponent implements OnInit {

    @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
    searchWord$ = new Subject<string>();

    constructor(
        protected routerEventsService: RouterEventsService,
        protected route: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit(): void {
        this.route.queryParams
            .pipe(take(1), delay(300))
            .subscribe((params) => {
                if (params['search'] && this.searchField) {
                    this.searchField.nativeElement.value = params['search'];
                }
            });

        this.searchWord$
            .pipe(debounceTime(700))
            .subscribe(this.onSearchUpdate.bind(this));
    }

    onSearchKeyUp(event: Event|KeyboardEvent): void {
        this.searchWord$.next((event.target as HTMLInputElement).value);
    }

    onSearchUpdate(searchWord: string): void {
        const queryParams: Params = {search: searchWord || null};
        this.router.navigate(
            [],
            {
                relativeTo: this.route,
                queryParams,
                queryParamsHandling: 'merge'
            }
        );
    }
}
