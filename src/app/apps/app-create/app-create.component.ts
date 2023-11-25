import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { ApplicationItem } from '../models/application-item.interface';
import { ApplicationService } from '../../services/application.service';
import { AppBlock } from '../models/app-block.interface';

@Component({
    selector: 'app-application-create',
    templateUrl: './app-create.component.html',
    styleUrls: ['./app-create.component.css'],
    providers: [ApiService]
})
export class ApplicationCreateComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;

    itemId: number = 0;
    data: ApplicationItem = ApplicationService.getDefault();
    blocks: AppBlock[] = [
        {id: 0, type: 'empty'},
        {id: 0, type: 'empty'},
        {id: 0, type: 'empty'}
    ];
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected dataService: ApplicationService
    ) {}

    ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        }
    }

    findEmptyBlocks(): AppBlock[] {
        return this.blocks.filter((item) => {
            return item.type === 'empty';
        });
    }

    deleteEmptyBlockByGrid(): void {
        const gridColumns = this.data.gridColumns;
        let emptyItems = this.findEmptyBlocks();
        const index = this.blocks.findIndex((item) => {
            return item.type === 'empty';
        });
        this.blocks.splice(index, 1);

        emptyItems = this.findEmptyBlocks();
        if (emptyItems.length < gridColumns) {
            this.deleteEmptyBlockByGrid();
        }
    }

    addEmptyBlockByGrid(): void {
        const gridColumns = this.data.gridColumns;
        let emptyItems = this.findEmptyBlocks();
        this.blocks.push({id: 0, type: 'empty'});

        emptyItems = this.findEmptyBlocks();
        if (emptyItems.length < gridColumns) {
            this.addEmptyBlockByGrid();
        }
    }

    setValue(key: string, value: number): void {
        this.data[key] = value;
        if (key === 'gridColumns') {
            let emptyItems = this.findEmptyBlocks();
            if (emptyItems.length > value) {
                this.deleteEmptyBlockByGrid();
            }
            if (emptyItems.length < value) {
                this.addEmptyBlockByGrid();
            }
        }
    }

    createBlockInit(index: number): void {
        console.log('createBlockInit', index);
    }

    getData(): void {
        // this.apiService.getItem(this.itemId)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.data = res;
        //             this.loading = false;
        //         },
        //         error: (err) => {
        //             this.errors = err;
        //             this.loading = false;
        //         }
        //     });
    }

    saveData(): void {
        // this.message = '';
        // this.errors = {};
        // this.loading = true;
        // this.submitted = true;
        // this.apiService.updateItem(this.data)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.loading = false;
        //             this.submitted = false;
        //             this.router.navigate(['/apis']);
        //         },
        //         error: (err) => {
        //             this.errors = err;
        //             this.message = 'Please correct the errors.';
        //             this.messageType = 'error';
        //             this.loading = false;
        //             this.submitted = false;
        //         }
        //     });
    }

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
