import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { catchError, concat, debounceTime, distinctUntilChanged, Observable, of, Subject, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiItem } from '../../../apis/models/api-item.interface';
import { ApiService } from '../../../services/api.service';
import { ApplicationService } from '../../../services/application.service';

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html'
})
export class AppActionComponent implements OnInit {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    selectedId: number = 0;
    selectedApi: ApiItem;
    items$: Observable<ApiItem[]>;
    searchInput$ = new Subject<string>();
    loading = false;
    submitted = false;

    constructor(
        protected dataService: ApiService,
        protected applicationService: ApplicationService
    ) {}

    ngOnInit(): void {
        this.loadItems();
    }

    submit(): void {
        this.close.emit('submit');
    }

    closeModal(): void {
        this.close.emit('close');
    }

    private loadItems() {
        this.items$ = concat(
            of([]),
            this.searchInput$.pipe(
                distinctUntilChanged(),
                debounceTime(700),
                tap(() => this.loading = true),
                switchMap(term => this.dataService.searchItems(term).pipe(
                    catchError(() => of([])),
                    tap(() => this.loading = false)
                ))
            )
        );
    }
}
