import {Component, OnInit} from '@angular/core';

import {Subject, takeUntil} from 'rxjs';

import {ApiService} from '../../services/api.service';
import {ApiItem} from '../models/api-item.interface';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [ApiService]
})
export class ListComponent implements OnInit {

    items: ApiItem[] = [];
    loading = false;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected apiService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.getData();
    }

    getData(): void {
        this.loading = true;
        this.apiService.getList()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }
}
