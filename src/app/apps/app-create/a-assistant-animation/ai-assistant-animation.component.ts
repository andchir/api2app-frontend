import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgIf } from '@angular/common';

import { Subject } from 'rxjs';

@Component({
    selector: 'app-ai-assistant-animation',
    standalone: true,
    imports: [
        NgIf
    ],
    templateUrl: './ai-assistant-animation.component.html'
})
export class AiAssistantAnimationComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    errorMessage: string = '';
    destroyed$: Subject<void> = new Subject();

    currentState: 'greetings'|'thinking'|'idea'|'working' = 'greetings';

    states = {
        greetings: {
            img: 'assets/img/robot-4.png'
        },
        thinking: {
            img: 'assets/img/robot-1.png'
        },
        idea: {
            img: 'assets/img/robot-2.png'
        },
        working: {
            img: 'assets/img/robot-3.png'
        }
    }

    constructor(
        protected cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
