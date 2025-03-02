import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';


@Component({
    selector: 'app-table-element',
    templateUrl: 'table-element.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TableElementComponent),
        multi: true
    }],
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgClass,
        FormsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableElementComponent implements ControlValueAccessor {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() isHTML: boolean = false;
    @Input() editable: boolean = false;
    @Input() keys: string[] = [];
    @Input() headers: string[] = [];
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    private _value: any[];

    get value(): any[] {
        return this._value;
    }

    @Input()
    set value(val) {
        this._value = this.stringifyValues(val);
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    stringifyValues(val: any): any {
        if (!val) {
            return null;
        }
        val.forEach((row) => {
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    row[key] = '';
                    Object.keys(value).forEach(function(k) {
                        row[key] += k + ":\n";
                        row[key] += value[k] + ":\n";
                    });
                }
            }
        });
        return val;
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: any[]) {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    addRow(): void {
        if (this.editorMode) {
            return;
        }
        const row = Object.fromEntries(this.keys.map((key, index) => [key, '']));
        if (!this.value) {
            this.value = [];
        }
        this.value.push(row);
    }

    removeRow(index: number): void {
        this.value.splice(index, 1);
    }
}
