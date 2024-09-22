import {Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
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
    language: string = '';
    languagesList: {name: string, title: string}[] = [
        {
            name: 'all',
            title: $localize `All languages`
        },
        {
            name: 'en',
            title: 'English'
        },
        {
            name: 'ru',
            title: 'Русский'
        },
        {
            name: 'fr',
            title: 'Français'
        }
    ];

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected routerEventsService: RouterEventsService,
        protected route: ActivatedRoute,
        protected router: Router
    ) {
        this.language = locale;
    }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(take(1), delay(300))
            .subscribe((params) => {
                if (params['search'] && this.searchField) {
                    this.searchField.nativeElement.value = params['search'];
                }
                if (params['language']) {
                    this.language = params['language'];
                }
            });

        this.searchWord$
            .pipe(debounceTime(700))
            .subscribe(this.onSearchUpdate.bind(this));
    }

    onSearchKeyUp(event: Event|KeyboardEvent): void {
        this.searchWord$.next((event.target as HTMLInputElement).value);
    }

    onSearchLanguageUpdate(): void {
        this.onSearchUpdate(this.searchField.nativeElement.value);
    }

    onSearchUpdate(searchWord: string): void {
        const queryParams: Params = {
            search: searchWord || null,
            language: this.language
        };
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
