import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { ApplicationService } from '../../../../services/application.service';

@Component({
    selector: 'app-input-tags-element',
    templateUrl: './input-tags-element.component.html',
    imports: [FormsModule, NgSelectModule],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InputTagsElementComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputTagsElementComponent implements ControlValueAccessor {

    @Input() choices: string[] = [];
    @Input() placeholder = '';
    @Input() allowAdd = false;
    @Input() valueAsString = false;
    @Input() labelForId = '';

    tags: string[] = [];
    disabled = false;

    constructor(private cdr: ChangeDetectorRef) {}

    onChange(_: string[] | string): void {}

    onTouched(): void {}

    writeValue(value: string[] | string | null): void {
        this.tags = ApplicationService.parseTagsValue(value);
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (value: string[] | string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }

    tagsChanged(tags: string[] | null): void {
        this.tags = ApplicationService.parseTagsValue(tags);
        this.onChange(this.valueAsString ? this.tags.join(',') : this.tags);
        this.onTouched();
    }
}
