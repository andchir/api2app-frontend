import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-top-up-balance',
    templateUrl: './modal-topup-balance.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        NgClass
    ],
    styleUrls: []
})
export class ModalTopUpBalanceComponent implements OnInit {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();

    submitted: boolean = false;
    value: number = 100;

    ngOnInit(): void {

    }

    closeModal(reason: string = 'close'): void {
        if (this.submitted) {
            return;
        }
        this.close.emit(reason);
    }

    confirm(): void {
        this.submitted = true;
        console.log(this.value);


    }
}
