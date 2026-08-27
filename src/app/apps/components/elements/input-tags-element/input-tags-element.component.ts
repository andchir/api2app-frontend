import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
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

    readonly choices = input<string[]>([]);
    readonly placeholder = input('');
    readonly allowAdd = input(false);
    readonly valueAsString = input(false);
    readonly labelForId = input('');
    readonly clearable = input(true);
    readonly searchable = input(true);

    readonly tags = signal<string[]>([]);
    readonly disabled = signal(false);

    onChange(_: string[] | string): void {}

    onTouched(): void {}

    writeValue(value: string[] | string | null): void {
        this.tags.set(ApplicationService.parseTagsValue(value));
    }

    registerOnChange(fn: (value: string[] | string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    tagsChanged(tags: string[] | null): void {
        const value = ApplicationService.parseTagsValue(tags);
        this.tags.set(value);
        this.onChange(this.valueAsString() ? value.join(',') : value);
        this.onTouched();
    }
}
