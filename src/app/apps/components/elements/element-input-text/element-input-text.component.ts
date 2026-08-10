import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    forwardRef,
    input,
    OnInit,
    output,
    signal,
    untracked,
    viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

declare const vkBridge: any;

@Component({
    selector: 'app-element-input-text',
    templateUrl: 'element-input-text.component.html',
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ElementInputTextComponent),
            multi: true
        }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ElementInputTextComponent implements OnInit, ControlValueAccessor {

    readonly inputControl = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputControl');

    readonly editorMode = input(false);
    readonly type = input<'input-text' | 'input-textarea'>();
    readonly locale = input<string>();
    readonly name = input<string>();
    readonly label = input<string>();
    readonly icon = input<string>();
    readonly placeholder = input<string>();
    readonly parentIndex = input<number>();
    readonly index = input<number>();
    readonly rows = input(6);
    readonly maxLength = input(0);
    readonly readOnly = input(false);
    readonly storeValue = input(false);
    readonly speechRecognitionEnabled = input(false);
    readonly speechSynthesisEnabled = input(false);
    readonly copyToClipboardEnabled = input(false);
    readonly autoHeight = input(true);
    readonly valueInput = input<string | null>(undefined, { alias: 'value' });

    readonly valueChange = output<string>();
    readonly message = output<string[]>();

    readonly value = signal('');
    readonly isChanged = signal(false);
    readonly isTouched = signal(false);
    readonly microphoneActive = signal(false);
    readonly speechSynthesisActive = signal(false);
    readonly paddingRight = computed(() => {
        const enabledButtons = [
            this.speechRecognitionEnabled(),
            this.speechSynthesisEnabled(),
            this.copyToClipboardEnabled()
        ].filter(Boolean).length;

        return `${0.625 + enabledButtons * 2}rem`;
    });
    readonly hasBottomControls = computed(() =>
        this.speechRecognitionEnabled()
        || this.speechSynthesisEnabled()
        || this.copyToClipboardEnabled()
    );
    readonly paddingBottom = computed(() => this.hasBottomControls() ? '2.3rem' : '0');
    readonly hasControls = computed(() => this.hasBottomControls() || Boolean(this.maxLength()));

    isVkApp: boolean = false;
    private timer: ReturnType<typeof setTimeout> | undefined;
    // @ts-ignore
    recognition: SpeechRecognition;

    constructor() {
        effect(() => {
            const inputValue = this.valueInput();
            const maxLength = this.maxLength();

            untracked(() => {
                if (inputValue !== undefined) {
                    this.setValue(inputValue);
                } else if (maxLength && this.value().length > maxLength) {
                    this.setValue(this.value());
                }
            });
        });
    }

    ngOnInit(): void {
        if (typeof vkBridge !== 'undefined' && window['isVKApp'] && !this.isVkApp) {
            this.isVkApp = true;
        }
    }

    microphoneEnableToggle(): void {
        if (this.editorMode()) {
            this.microphoneActive.set(false);
            return;
        }
        if (!SpeechRecognition) {
            alert($localize `Speech recognition is not supported in your browser. Try using a different browser.`);
            return;
        }
        this.microphoneActive.update((active) => !active);
        if (this.microphoneActive()) {
            const currentValue = this.value().trim();
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.locale() || window.document.documentElement.lang;
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
                if (this.recognition && this.microphoneActive()) {
                    this.recognition.start();
                }
            });
            this.recognition.start();
        } else if (this.recognition) {
            this.recognition.stop();
            this.recognition.abort();
            this.recognition = null;
        }
    }

    copyToClipboard(): void {
        if (this.editorMode() || !this.value() || !navigator.clipboard) {
            if (!navigator.clipboard) {
                console.log('Clipboard API is not supported by the browser.');
            }
            return;
        }
        const inputEl = this.inputControl()?.nativeElement;
        if (!inputEl) {
            return;
        }
        const textContent: string = String(inputEl.value);

        if (this.isVkApp) {
            vkBridge.send('VKWebAppCopyText', {
                    text: textContent
                })
                .then((data) => {
                    if (data.result) {
                        const message = $localize `The value has been successfully copied to the clipboard.`;
                        this.message.emit([message, 'success']);
                    } else {
                        const message = $localize `Sorry, copying to clipboard is not allowed.`;
                        this.message.emit([message, 'error']);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    const message = $localize `Sorry, copying to clipboard is not allowed.`;
                    this.message.emit([message, 'error']);
                });
        } else {
            this.writeClipboardText(textContent)
                .then(() => {
                    const message = $localize `The value has been successfully copied to the clipboard.`;
                    this.message.emit([message, 'success']);
                })
                .catch(() => {
                    const message = $localize `Sorry, copying to clipboard is not allowed.`;
                    this.message.emit([message, 'error']);
                });
        }
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
        if (this.editorMode() || !this.value() || !window.speechSynthesis) {
            return;
        }
        this.speechSynthesisActive.update((active) => !active);
        if (this.speechSynthesisActive()) {
            const sentences = this.getSentences(this.value());// Browser Chrome bug fix https://issues.chromium.org/issues/41346274
            const speechSynthesisUtterance = new SpeechSynthesisUtterance(sentences[0]);
            speechSynthesisUtterance.addEventListener('end', () => {
                // console.log('END', speechSynthesisUtterance.text);
                sentences.shift();
                if (this.speechSynthesisActive() && sentences.length > 0) {
                    speechSynthesisUtterance.text = sentences[0];
                    window.speechSynthesis.speak(speechSynthesisUtterance);
                } else {
                    window.speechSynthesis.cancel();
                    this.speechSynthesisActive.set(false);
                }
            });
            speechSynthesisUtterance.addEventListener('start', () => {
                // console.log('START', speechSynthesisUtterance.text);
            });
            speechSynthesisUtterance.addEventListener('error', (e) => {
                console.log('ERROR', e);
                if (this.speechSynthesisActive()) {
                    console.log('error', e.error);
                    window.speechSynthesis.cancel();
                    this.speechSynthesisActive.set(false);
                }
            });
            window.speechSynthesis.speak(speechSynthesisUtterance);
        } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        }
    }

    getSentences(text: string, maxlength = 180): string[] {
        const sentenceRegex = /[^.!?]+[.!?]*/g;
        const sentences = text.match(sentenceRegex) || [];

        const result = [];
        let currentChunk = '';

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();

            // If the current chunk plus the new sentence fits into maxlength
            if (currentChunk.length + sentence.length + 1 <= maxlength) {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
                // If the current chunk is not empty, add it to the result
                if (currentChunk) {
                    result.push(currentChunk);
                    currentChunk = '';
                }

                // If the sentence is too long, break it into parts
                if (sentence.length > maxlength) {
                    const words = sentence.split(' ');
                    let tempChunk = '';

                    for (const word of words) {
                        if (tempChunk.length + word.length + 1 <= maxlength) {
                            tempChunk += (tempChunk ? ' ' : '') + word;
                        } else {
                            if (tempChunk) {
                                result.push(tempChunk);
                                tempChunk = '';
                            }
                            tempChunk = word;
                        }
                    }

                    if (tempChunk) {
                        result.push(tempChunk);
                    }
                } else {
                    currentChunk = sentence;
                }
            }
        }
        if (currentChunk) {
            result.push(currentChunk);
        }
        return result;
    }

    capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    onChange(_: string) {}

    onTouched(_: any) {}

    writeValue(value: unknown): void {
        const normalizedValue = String(value || '');
        if (this.value() && normalizedValue && this.value() !== normalizedValue) {
            this.isChanged.set(true);
        }
        this.setValue(normalizedValue);
        const inputControl = this.inputControl()?.nativeElement;
        if (inputControl) {
            inputControl.value = this.value();
            if (this.type() === 'input-textarea') {
                this.onInputTextarea();
            }
        }
        this.scrollTextareaBottom();
    }

    registerOnChange(fn: (_: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: FocusEvent) => void): void {
        this.onTouched = fn;
    }

    onInputTextarea(): void {
        if (!this.autoHeight() || this.type() !== 'input-textarea' || !this.inputControl()?.nativeElement) {
            return;
        }
        const textAreaEl = this.inputControl()?.nativeElement;
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

    private scrollTextareaBottom(): void {
        if (this.type() !== 'input-textarea' || !this.inputControl()?.nativeElement) {
            return;
        }
        setTimeout(() => {
            const textAreaEl = this.inputControl()?.nativeElement;
            if (!textAreaEl) {
                return;
            }
            this.onInputTextarea();
            textAreaEl.scrollTop = textAreaEl.scrollHeight;
        }, 1);
    }

    onKeyUp(): void {
        this.isChanged.set(true);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.valueChange.emit(this.value());
        }, 700);
    }

    onFocus(event: FocusEvent): void {
        this.onTouched(event);
        this.isTouched.set(true);
    }

    setValue(value: string | null): void {
        const maxLength = this.maxLength();
        let normalizedValue = value || '';
        if (maxLength && normalizedValue.length > maxLength) {
            normalizedValue = normalizedValue.substring(0, maxLength);
        }
        this.value.set(normalizedValue);
        this.onChange(normalizedValue);
    }
}
