import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {NgIf} from '@angular/common';

import {
    catchError,
    concat,
    debounceTime,
    distinctUntilChanged,
    map,
    Observable,
    of,
    Subject,
    takeUntil,
    tap
} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';
import {NgxTippyModule} from 'ngx-tippy-wrapper';

import {SharedModule} from '../../../../../miniapp-src/app/shared.module';
import {ApiItem} from '../../../apis/models/api-item.interface';
import {ApiService} from '../../../services/api.service';


@Component({
    selector: 'app-import-application',
    standalone: true,
    imports: [
        NgIf,
        SharedModule,
        NgxTippyModule
    ],
    templateUrl: './edit-app-ai.component.html'
})
export class EditAppAiComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    loading: boolean = false;
    loadingMain: boolean = false;
    errorMessage: string = '';
    inputString: string = '';
    selectedUuid: string | null = null;
    selectedApiList: Partial<ApiItem>[] = [];
    selectedApi: ApiItem;
    items$: Observable<ApiItem[]>;
    searchInput$ = new Subject<string>();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected dataService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.loadItems();

        // TODO: load selectedApiList names
    }

    private loadItems() {
        this.items$ = concat(
            of([]),
            this.searchInput$.pipe(
                takeUntil(this.destroyed$),
                distinctUntilChanged(),
                filter(input => !!input),
                debounceTime(700),
                tap(() => this.loading = true),
                switchMap(term => this.dataService.searchItems(term).pipe(
                    map(res => res.results),
                    catchError(() => of([])),
                    tap(() => {
                        this.loading = false;
                        this.cdr.detectChanges();
                    })
                ))
            )
        );
    }

    onSearchCleared(): void {
        this.selectedUuid = '';
        this.selectedApi = null;
        this.loadItems();
    }

    onApiSelected(): void {
        if (!this.selectedUuid) {
            this.cdr.detectChanges();
            return;
        }
        this.loading = true;
        this.cdr.detectChanges();
        this.dataService.getItemByUuid(this.selectedUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    const {id, name, uuid} = res;
                    this.selectedApiList.push({id, name, uuid});
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    removeSelectedApi(index: number) {
        this.selectedApiList.splice(index, 1);
    }

    submit(): void {
        this.loadingMain = true;

    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
