import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';

import { Subject } from 'rxjs';

import { PercentComponent } from '../../../shared/percent/percent.component';

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

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() percentCurrent = 0;
    @Input() data: any[] = [];
    @Input() dataJson: string|null = null;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    private _value: string;
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
