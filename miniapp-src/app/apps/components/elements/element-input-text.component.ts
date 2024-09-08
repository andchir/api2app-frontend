import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    ViewChild
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

    @ViewChild('inputControl') inputControl: ElementRef<HTMLInputElement>;
    @Input() editorMode = false;
    @Input() type: string;
    @Input() name: string;
    @Input() label: string;
    @Input() icon: string;
    @Input() placeholder: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() readOnly: boolean;
    @Input() storeValue: boolean;
    @Input() speechRecognitionEnabled = false;
    @Input() speechSynthesisEnabled = false;
    @Input() copyToClipboardEnabled = false;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();
    private _value;
    isChanged = false;
    isTouched = false;
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

    copyToClipboard(inputEl: HTMLInputElement): void {
        if (this.editorMode || !this.value || !navigator.clipboard) {
            if (!navigator.clipboard) {
                console.log('Clipboard API is not supported by the browser.');
            }
            return;
        }
        inputEl.select();
        inputEl.setSelectionRange(0, 99999);

        this.writeClipboardText(inputEl.value)
            .then(() => {
                const message = $localize `The value has been successfully copied to the clipboard.`;
                this.message.emit([message, 'success']);
            })
            .catch(() => {
                const message = $localize `Sorry, copying to clipboard is not allowed.`;
                this.message.emit([message, 'error']);
            });
    }

    async writeClipboardText(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.log(error.message);
            return Promise.reject(error.message);
        }
    }

    speechSynthesisPlayToggle(): void {
        if (this.editorMode || !this.value || !window.speechSynthesis) {
            return;
        }
        this.speechSynthesisActive = !this.speechSynthesisActive;
        if (this.speechSynthesisActive) {
            const sentences = this.getSentences(this.value);// Browser Chrome bug fix https://issues.chromium.org/issues/41346274
            const speechSynthesisUtterance = new SpeechSynthesisUtterance(sentences[0]);
            speechSynthesisUtterance.addEventListener('end', () => {
                sentences.shift();
                if (this.speechSynthesisActive && sentences.length > 0) {
                    speechSynthesisUtterance.text = sentences[0];
                    window.speechSynthesis.speak(speechSynthesisUtterance);
                } else {
                    window.speechSynthesis.cancel();
                    this.speechSynthesisActive = false;
                    this.cdr.detectChanges();
                }
            });
            speechSynthesisUtterance.addEventListener('start', () => {
                // console.log('start', speechSynthesisUtterance.text);
            });
            speechSynthesisUtterance.addEventListener('error', (e) => {
                if (this.speechSynthesisActive) {
                    console.log('error', e.error);
                    window.speechSynthesis.cancel();
                    this.speechSynthesisActive = false;
                    this.cdr.detectChanges();
                }
            });
            window.speechSynthesis.speak(speechSynthesisUtterance);
        } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        }
        this.cdr.detectChanges();
    }

    getSentences(text: string, maxlength = 220): string[] {
        const sentences = this.value.split('. ')
            .filter((s: string) => {
                return s.trim();
            })
            .map((s: string, index: number, array: string[]) => {
                return s.trim() + (index + 1 < array.length ? '.' : '');
            });

        const sentencesOut = [];
        sentences.forEach((s: string) => {
            if (s.length > maxlength) {
                const index = s.indexOf(' ', Math.floor(s.length / 2))
                sentencesOut.push(s.substring(0, index).trim());
                sentencesOut.push(s.substring(index).trim());
                return;
            }
            sentencesOut.push(s);
        });
        return sentencesOut;
    }

    capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: any) {
        if (this.value && value && this.value !== value) {
            this.isChanged = true;
        }
        this.value = value;
        if (this.inputControl.nativeElement) {
            this.inputControl.nativeElement.value = value;
        }
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    onKeyUp(event: KeyboardEvent) {
        this.value = (event.target as HTMLInputElement).value;
        this.isChanged = true;
    }

    onFocus(event: FocusEvent) {
        this.onTouched(event);
        this.isTouched = true;
    }
}
