import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-apis-list-shared',
    templateUrl: './shared.component.html',
    styleUrls: [],
    providers: []
})
export class ListSharedComponent implements OnInit {

    items: ApiItem[] = [];
    loading = false;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private authService: AuthService,
        private apiService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.getData();
    }

    getData(): void {
        this.loading = true;
        this.apiService.getListShared()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.loading = false;
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/shared/', item.uuid]);
    }
}
