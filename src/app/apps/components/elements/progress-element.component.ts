import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { NgIf } from '@angular/common';

import { Subject } from 'rxjs';
import {PercentComponent} from "../../../shared/percent/percent.component";

@Component({
    standalone: true,
    selector: 'app-progress',
    templateUrl: 'progress-element.component.html',
    imports: [
        NgIf,
        PercentComponent
    ],
    providers: []
})
export class ProgressElementComponent implements OnInit, OnDestroy, OnChanges {

    @Input() percentCurrent = 0;
    @Input() data: any[] = [];
    @Input() dataJson: string|null = null;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (this.dataJson) {
            this.data = JSON.parse(this.dataJson);
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
