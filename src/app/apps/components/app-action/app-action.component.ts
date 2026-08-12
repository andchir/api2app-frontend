import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    OnInit,
    Output,
    computed,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
    EMPTY,
    Subject,
    catchError,
    distinctUntilChanged,
    finalize,
    map,
    of,
    switchMap,
    tap,
    timer
} from 'rxjs';

import { ApiItem } from '../../../apis/models/api-item.interface';
import { ApiService } from '../../../services/api.service';
import { AppBlockElementType } from '../../models/app-block.interface';

type ActionType = 'input' | 'output';
type FieldType = 'input' | 'output' | 'params' | 'headers' | 'url' | number | null;

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AppActionComponent implements OnInit {

    @Output() readonly close = new EventEmitter<string>();

    elementType: AppBlockElementType;
    actionType: ActionType;
    note: string;

    readonly searchInput$ = new Subject<string>();
    readonly items = signal<ApiItem[]>([]);
    readonly urlParts = signal<string[]>([]);
    readonly inputFields = signal<string[]>([]);
    readonly inputParams = signal<string[]>([]);
    readonly inputHeaders = signal<string[]>([]);
    readonly outputFields = signal<string[]>([]);

    private readonly selectedUuidState = signal<string | null>(null);
    private readonly selectedApiState = signal<ApiItem | null>(null);
    private readonly selectedFieldNameState = signal<string | number | null>(null);
    private readonly selectedFieldTypeState = signal<FieldType>(null);
    private readonly queryParameterNameState = signal('');
    private readonly searchLoading = signal(false);
    private readonly apiLoading = signal(false);
    private readonly apiSelection$ = new Subject<string | null>();

    readonly loading = computed(() => this.searchLoading() || this.apiLoading());

    constructor(
        private readonly destroyRef: DestroyRef,
        private readonly dataService: ApiService
    ) {}

    get selectedUuid(): string | null {
        return this.selectedUuidState();
    }

    set selectedUuid(value: string | null) {
        this.selectedUuidState.set(value);
    }

    get selectedApi(): ApiItem | null {
        return this.selectedApiState();
    }

    get selectedFieldName(): string | number | null {
        return this.selectedFieldNameState();
    }

    set selectedFieldName(value: string | number | null) {
        this.selectedFieldNameState.set(value);
    }

    get selectedFieldType(): FieldType {
        return this.selectedFieldTypeState();
    }

    set selectedFieldType(value: FieldType) {
        this.selectedFieldTypeState.set(value);
    }

    get queryParameterName(): string {
        return this.queryParameterNameState();
    }

    set queryParameterName(value: string) {
        this.queryParameterNameState.set(value);
    }

    ngOnInit(): void {
        this.initSearch();
        this.initApiSelection();

        if (this.selectedUuid) {
            this.onApiSelected();
        }
    }

    submit(): void {
        this.close.emit('submit');
    }

    closeModal(): void {
        this.close.emit('close');
    }

    onApiSelected(): void {
        this.apiSelection$.next(this.selectedUuid);
    }

    onSearchCleared(): void {
        this.selectedUuid = '';
        this.selectedApiState.set(null);
        this.selectedFieldName = null;
        this.selectedFieldType = null;
        this.clearApiOptions();

        // Empty values cancel active search and API detail requests via switchMap.
        this.searchInput$.next('');
        this.apiSelection$.next(null);
    }

    isFullUrl(url: string): boolean {
        return ApiService.isFullUrl(url);
    }

    selectField(fieldName: string | number, fieldType: FieldType): void {
        if (this.selectedFieldName === fieldName && this.selectedFieldType === fieldType) {
            this.selectedFieldName = null;
            this.selectedFieldType = null;
            return;
        }

        this.selectedFieldName = fieldName;
        this.selectedFieldType = fieldType;
        this.queryParameterName = '';
    }

    private initSearch(): void {
        this.searchInput$.pipe(
            distinctUntilChanged(),
            switchMap(input => {
                const term = input?.trim();
                if (!term) {
                    this.searchLoading.set(false);
                    return of([] as ApiItem[]);
                }

                return timer(700).pipe(
                    tap(() => this.searchLoading.set(true)),
                    switchMap(() => this.dataService.searchItems(term).pipe(
                        map(response => response.results),
                        catchError(() => of([] as ApiItem[]))
                    )),
                    finalize(() => this.searchLoading.set(false))
                );
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(items => this.items.set(items));
    }

    private initApiSelection(): void {
        this.apiSelection$.pipe(
            distinctUntilChanged(),
            switchMap(uuid => {
                if (!uuid) {
                    this.apiLoading.set(false);
                    return EMPTY;
                }

                this.selectedApiState.set(null);
                this.inputFields.set([]);
                this.outputFields.set([]);
                this.apiLoading.set(true);

                return this.dataService.getItemByUuid(uuid).pipe(
                    catchError(error => {
                        console.error(error);
                        this.onSearchCleared();
                        return EMPTY;
                    }),
                    finalize(() => this.apiLoading.set(false))
                );
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(api => {
            this.selectedApiState.set(api);
            if (this.items().length === 0) {
                this.items.set([api]);
            }
            this.setApiOptions(api);
        });
    }

    private setApiOptions(api: ApiItem): void {
        this.clearApiOptions();

        if (this.elementType === 'button' && this.actionType === 'input') {
            this.inputFields.set(['submit']);
            return;
        }

        if (this.actionType === 'input') {
            this.setInputOptions(api);
            return;
        }

        const outputFields = api.responseContentType === 'json' && api.responseBody
            ? ApiService.getPropertiesRecursively(
                typeof api.responseBody === 'string' ? JSON.parse(api.responseBody) : {}
            ).outputKeys
            : [];
        this.outputFields.set(['value', ...outputFields]);
    }

    private setInputOptions(api: ApiItem): void {
        if (api.requestUrl) {
            const parts = api.requestUrl.split('/');
            const urlParts: string[] = [];
            if (this.isFullUrl(api.requestUrl)) {
                urlParts.push(`${parts[0]}//${parts[2]}`);
                parts.splice(0, 3);
            }
            this.urlParts.set([...urlParts, ...parts]);
        }

        let inputFields = api.bodyDataSource === 'fields'
            ? this.getArrayValues(api, 'bodyFields')
            : [];

        if (api.bodyDataSource === 'fields') {
            inputFields = [...inputFields, ...this.getJsonInputFields(api)];
        }

        const rawFields = this.dataService.getRawDataFields(api);
        const hasRawData = api.bodyDataSource === 'raw'
            && api.bodyContent
            && api.requestContentType === 'json';
        if (hasRawData || rawFields.length > 0) {
            const bodyContent = typeof api.bodyContent === 'string' ? JSON.parse(api.bodyContent) : {};
            inputFields = [
                ...inputFields,
                ...ApiService.getPropertiesRecursively(bodyContent).outputKeys
            ];
        }

        this.inputFields.set(['value', ...inputFields]);
        this.inputParams.set(this.getArrayValues(api, 'queryParams'));
        this.inputHeaders.set(this.getArrayValues(api, 'headers'));
    }

    private getJsonInputFields(api: ApiItem): string[] {
        return (api['bodyFields'] || []).flatMap(item => {
            if (!ApiService.isJson(item.value)) {
                return [];
            }

            return Object.keys(JSON.parse(item.value as string))
                .map(key => `${item.name}.${key}`);
        });
    }

    private getArrayValues(api: ApiItem, inputKey: string, targetKey = 'name'): string[] {
        return (api[inputKey] || [])
            .filter(item => !item.hidden)
            .map(item => item[targetKey])
            .filter(Boolean);
    }

    private clearApiOptions(): void {
        this.urlParts.set([]);
        this.inputFields.set([]);
        this.inputParams.set([]);
        this.inputHeaders.set([]);
        this.outputFields.set([]);
    }
}
