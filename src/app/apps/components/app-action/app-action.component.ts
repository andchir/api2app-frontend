import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import {
    Observable,
    Subject,
    catchError,
    concat,
    debounceTime,
    distinctUntilChanged,
    map,
    of,
    takeUntil,
    tap
} from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { ApiItem } from '../../../apis/models/api-item.interface';
import { ApiService } from '../../../services/api.service';
import { ApplicationService } from '../../../services/application.service';

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html'
})
export class AppActionComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    selectedId: number = null;
    selectedApi: ApiItem;
    items$: Observable<ApiItem[]>;
    loading = false;
    submitted = false;
    searchInput$ = new Subject<string>();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected dataService: ApiService,
        protected applicationService: ApplicationService
    ) {}

    ngOnInit(): void {
        this.loadItems();
        if (this.selectedId) {
            this.onApiSelected();
        }
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
                filter(input => !!input),
                debounceTime(700),
                tap(() => this.loading = true),
                switchMap(term => this.dataService.searchItems(term).pipe(
                    map(res => res.results),
                    catchError(() => of([])),
                    tap(() => this.loading = false)
                ))
            )
        );
    }

    onApiSelected(): void {
        if (!this.selectedId) {
            return;
        }
        this.loading = true;
        this.dataService.getItem(this.selectedId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.selectedApi = res;
                    this.items$
                        .pipe(take(1))
                        .subscribe({
                            next: (items) => {
                                if (items.length === 0) {
                                    this.items$ = of([res]);
                                }
                            }
                        });
                    this.loading = false;
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    onSearchCleared(): void {
        this.selectedId = null;
        this.selectedApi = null;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
