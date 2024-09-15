import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-rename',
    templateUrl: './rename.component.html',
    styleUrls: []
})
export class RenameComponent implements OnInit {

    @Input() currentValue = '';
    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    @ViewChild('textField') textField: ElementRef<HTMLInputElement>;

    ngOnInit(): void {
        setTimeout(() => {
            if (this.textField.nativeElement) {
                this.textField.nativeElement.focus();
            }
        }, 100);
    }

    submit(): void {
        this.close.emit('submit');
    }

    closeModal(): void {
        this.close.emit('close');
    }
}
