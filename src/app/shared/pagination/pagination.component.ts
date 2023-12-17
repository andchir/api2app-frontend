import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PaginatorState } from '../../apps/models/paginator-state.interface';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnInit {

    @Input() totalRecords: number = 0;
    @Input() perPage: number = 16;
    @Input() pageLinkSize: number = 5;
    @Output() onPageChange: EventEmitter<PaginatorState> = new EventEmitter<PaginatorState>();

    paginatorState: PaginatorState;
    _first: number = 0;
    _page: number = 0;
    pageLinks: number[];

    @Input() get first(): number {
        return this._first;
    }
    set first(val: number) {
        this._first = val;
    }

    constructor() {}

    ngOnInit(): void {
        this.updatePaginatorState();
        this.updatePageLinks();
    }

    getPage(): number {
        return Math.floor(this.first / this.perPage);
    }

    getPageCount() {
        return Math.ceil(this.totalRecords / this.perPage);
    }

    currentPage() {
        return this.getPageCount() > 0 ? this.getPage() + 1 : 0;
    }

    calculatePageLinkBoundaries() {
        let numberOfPages = this.getPageCount(),
            visiblePages = Math.min(this.pageLinkSize, numberOfPages);

        //calculate range, keep current in middle if necessary
        let start = Math.max(0, Math.ceil(this.getPage() - visiblePages / 2)),
            end = Math.min(numberOfPages - 1, start + visiblePages - 1);

        //check when approaching to last page
        var delta = this.pageLinkSize - (end - start + 1);
        start = Math.max(0, start - delta);

        return [start, end];
    }

    changePageToPrev(event: Event) {
        event.preventDefault();
        this.changePage(this.getPage() - 1);
    }

    changePageToNext(event: Event) {
        event.preventDefault();
        this.changePage(this.getPage() + 1);
    }

    isFirstPage() {
        return this.getPage() === 0;
    }

    isLastPage() {
        return this.getPage() === this.getPageCount() - 1;
    }

    empty() {
        return this.getPageCount() === 0;
    }

    changePage(p: number) {
        var pc = this.getPageCount();
        if (p >= 0 && p < pc) {
            this._first = this.perPage * p;
            var state = {
                page: p,
                first: this.first,
                rows: this.perPage,
                pageCount: pc
            };
            this.updatePageLinks();
            this.onPageChange.emit(state);
            this.updatePaginatorState();
        }
    }

    onPageLinkClick(event: Event, page: number) {
        event.preventDefault();
        this.changePage(page);
    }

    updatePageLinks() {
        this.pageLinks = [];
        let boundaries = this.calculatePageLinkBoundaries(),
            start = boundaries[0],
            end = boundaries[1];

        for (let i = start; i <= end; i++) {
            this.pageLinks.push(i + 1);
        }
    }

    updatePaginatorState() {
        this.paginatorState = {
            page: this.getPage(),
            pageCount: this.getPageCount(),
            perPage: this.perPage,
            first: this.first,
            totalRecords: this.totalRecords
        };
    }
}
