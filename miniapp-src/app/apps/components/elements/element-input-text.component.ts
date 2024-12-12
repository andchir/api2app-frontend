import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input, OnChanges, OnInit,
    Output, SimpleChanges,
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
export class ElementInputTextComponent implements OnInit, OnChanges, ControlValueAccessor {

    @ViewChild('inputControl') inputControl: ElementRef<HTMLInputElement>;
    @Input() editorMode = false;
    @Input() type: 'input-text'|'input-textarea';
    @Input() name: string;
    @Input() label: string;
    @Input() icon: string;
    @Input() placeholder: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() rows: number = 6;
    @Input() maxLength: number = 0;
    @Input() readOnly: boolean;
    @Input() storeValue: boolean;
    @Input() speechRecognitionEnabled: boolean = false;
    @Input() speechSynthesisEnabled: boolean = false;
    @Input() copyToClipboardEnabled: boolean = false;
    @Input() autoHeight: boolean = true;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();
    private _value = '';
    isChanged = false;
    isTouched = false;
    microphoneActive = false;
    speechSynthesisActive = false;
    paddingRight = '0.625rem';
    paddingBottom = '0';
    // @ts-ignore
    recognition: SpeechRecognition;

    ngOnInit(): void {
        this.calculatePadding();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.calculatePadding();
    }

    get value() {
        return this._value || '';
    }

    @Input()
    set value(val) {
        if (this.maxLength && val.length > this.maxLength) {
            val = val.substring(0, this.maxLength);
        }
        this._value = val;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    calculatePadding(): void {
        const buttonWidth = 2;
        let paddingRightRem = 0.625;
        if (this.speechRecognitionEnabled) {
            paddingRightRem += buttonWidth;
        }
        if (this.speechSynthesisEnabled) {
            paddingRightRem += buttonWidth;
        }
        if (this.copyToClipboardEnabled) {
            paddingRightRem += buttonWidth;
        }
        this.paddingRight = `${paddingRightRem}rem`;
        this.paddingBottom = this.speechRecognitionEnabled || this.speechSynthesisEnabled || this.copyToClipboardEnabled ? '2.3rem' : '0';
    }

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
                this.writeValue(transcripts.join('. ') + '.');
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
        value = value || '';
        if (this.maxLength && value.length > this.maxLength) {
            value = value.substring(0, this.maxLength);
        }
        if (this.value && value && this.value !== value) {
            this.isChanged = true;
        }
        this.value = value;
        if (this.inputControl?.nativeElement) {
            this.inputControl.nativeElement.value = value;
            this.onInput();
        }
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    onInput(event?: Event|InputEvent): void {
        if (!this.autoHeight || this.type !== 'input-textarea' || !this.inputControl?.nativeElement) {
            return;
        }
        const textAreaEl = this.inputControl.nativeElement;
        if (!textAreaEl) {
            return;
        }
        const MAX_HEIGHT = 400;
        textAreaEl.style.overflowY = 'hidden';
        textAreaEl.style.height = 'auto';
        const scrollHeight = textAreaEl.scrollHeight;
        if (scrollHeight > MAX_HEIGHT) {
            textAreaEl.style.height = MAX_HEIGHT + 'px';
            textAreaEl.style.overflowY = 'auto';
            return;
        }
        textAreaEl.style.overflowY = 'hidden';
        textAreaEl.style.height = `${scrollHeight}px`;
    }

    onKeyUp(event: KeyboardEvent) {
        if (this.maxLength && (event.target as HTMLInputElement).value.length > this.maxLength) {
            (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.substring(0, this.maxLength);
        }
        this.value = (event.target as HTMLInputElement).value;
        this.isChanged = true;
    }

    onFocus(event: FocusEvent) {
        this.onTouched(event);
        this.isTouched = true;
    }
}
