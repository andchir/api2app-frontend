import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {NgIf} from '@angular/common';

import {
    catchError,
    concat,
    debounceTime,
    distinctUntilChanged, firstValueFrom,
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
import {ApplicationItem} from '../../models/application-item.interface';

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
    prompt: string = '';
    selectedUuid: string | null = null;
    appData: ApplicationItem;
    selectedApiList: Partial<ApiItem>[] = [];
    selectedApi: ApiItem;
    items$: Observable<ApiItem[]>;
    resultJsonString: string = '';
    searchInput$ = new Subject<string>();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected dataService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.loadItems();
        this.loadApiItemsDetails()
            .then((items) => {
                this.loadingMain = false;
                items.forEach((item) => {
                    const {id, name, uuid} = item;
                    const selectedApiItem = this.selectedApiList.find((selectedApi) => {
                        return selectedApi.uuid === uuid;
                    });
                    if (selectedApiItem) {
                        Object.assign(selectedApiItem, {id, name, uuid});
                    }
                });
                this.cdr.detectChanges();
            })
            .catch((err) => {
                console.log(err);
                this.loadingMain = false;
            });
    }

    loadApiItemsDetails(): Promise<any> {
        const selectedApiList = this.selectedApiList.filter((item) => {
            return !item.name;
        });
        if (this.selectedApiList.length === 0) {
            return Promise.resolve();
        }
        this.loadingMain = true;
        const promises = [];
        selectedApiList.forEach((item) => {
            promises.push(firstValueFrom(this.dataService.getItemByUuidShared(item.uuid)));
        });
        return Promise.all(promises);
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
        if (!this.prompt) {
            return;
        }
        this.errorMessage = '';
        this.loadingMain = true;
        this.cdr.detectChanges();

        const apiUuidList = this.selectedApiList.map((item) => {
            return item.uuid;
        });

        this.dataService.editByAi(this.prompt, this.appData, apiUuidList)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.resultJsonString = res.result || '';
                    this.loadingMain = false;
                    this.cdr.detectChanges();

                    this.closeModal('submit');
                },
                error: (err) => {
                    this.errorMessage = this.localizeServerMessages(err.error || err.detail || $localize `Error.`);
                    this.loadingMain = false;
                    this.cdr.detectChanges();
                }
            });
    }

    localizeServerMessages(errorMessage: string): string {
        if (errorMessage === 'Daily usage limit exceeded.') {
            errorMessage = $localize`Daily usage limit exceeded.`;
        }
        if (errorMessage === 'Insufficient funds.') {
            errorMessage = $localize `Insufficient funds.`;
        }
        return errorMessage;
    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    protected readonly $localize = $localize;
}
