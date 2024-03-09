import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

@Component({
    selector: 'app-element-input-text',
    templateUrl: 'element-input-text.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ElementInputTextComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementInputTextComponent implements ControlValueAccessor {

    @Input() editorMode = false;
    @Input() type: string;
    @Input() name: string;
    @Input() label: string;
    @Input() placeholder: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() readOnly: boolean;
    @Input() speechRecognitionEnabled = false;
    @Input() speechSynthesisEnabled = false;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    private _value;
    microphoneActive = false;
    speechSynthesisActive = false;
    // @ts-ignore
    recognition: SpeechRecognition;

    get value() {
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

    microphoneEnableToggle(): void {
        if (this.editorMode) {
            this.microphoneActive = false;
            return;
        }
        if (!SpeechRecognition) {
            alert($localize `Speech recognition is not supported in your browser. Try using a different browser.`);
            return;
        }
        this.microphoneActive = !this.microphoneActive;
        if (this.microphoneActive) {
            const currentValue = (this.value || '').trim();
            this.recognition = new SpeechRecognition();
            this.recognition.lang = window.document.documentElement.lang;
            this.recognition.interimResults = true;
            this.recognition.continuous = true;
            this.recognition.addEventListener('result', (event) => {
                const transcripts = Array.from(event.results).map((result) => {
                    return this.capitalize(result[0].transcript.trim());
                });
                // console.log('result', transcripts);
                if (currentValue) {
                    transcripts.unshift(currentValue);
                }
                this.value = transcripts.join('. ') + '.';
                this.cdr.detectChanges();
            });
            this.recognition.addEventListener('end', (event) => {
                // console.log('end', event);
                if (this.recognition && this.microphoneActive) {
                    this.recognition.start();
                }
            });
            this.recognition.start();
        } else if (this.recognition) {
            this.recognition.stop();
            this.recognition.abort();
            this.recognition = null;
        }
        this.cdr.detectChanges();
    }

    speechSynthesisPlayToggle(): void {
        if (this.editorMode || !this.value || !window.speechSynthesis) {
            return;
        }
        this.speechSynthesisActive = !this.speechSynthesisActive;
        if (this.speechSynthesisActive) {
            const speechSynthesisUtterance = new SpeechSynthesisUtterance(this.value);
            speechSynthesisUtterance.addEventListener('end', () => {
                window.speechSynthesis.cancel();
                this.speechSynthesisActive = false;
                this.cdr.detectChanges();
            });
            window.speechSynthesis.speak(speechSynthesisUtterance);
        } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        }
        this.cdr.detectChanges();
    }

    capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    onChange(_: any) {}

    writeValue(value: any) {
        this.value = value;
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched() {}
}
