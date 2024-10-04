import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
    selector: 'app-select-image',
    templateUrl: 'select-image.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectImageComponent),
        multi: true
    }],
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgClass
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectImageComponent implements ControlValueAccessor {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() showTitle: boolean = true;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() data: any[] = [];
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    private _value: string;

    get value(): string {
        return this._value;
    }

    @Input()
    set value(val) {
        this._value = val;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: string) {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    selectItem(item: any): void {
        if (this.editorMode) {
            return;
        }
        this.value = this.value !== item.name ? item.name : '';
    }
}
