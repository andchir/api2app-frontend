import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { Subject } from 'rxjs';
import {NgIf} from "@angular/common";
import {SharedModule} from "../../../../../miniapp-src/app/shared.module";


@Component({
    selector: 'app-import-application',
    standalone: true,
    imports: [
        NgIf,
        SharedModule
    ],
    templateUrl: './edit-app-ai.component.html'
})
export class EditAppAiComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    loading: boolean = false;
    errorMessage: string = '';
    inputString: string = '';
    destroyed$: Subject<void> = new Subject();

    ngOnInit(): void {

    }

    submit(): void {

    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
