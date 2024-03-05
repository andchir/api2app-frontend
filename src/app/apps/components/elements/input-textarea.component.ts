import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

@Component({
    selector: 'app-element-input-text',
    template: `
        <div class="w-full max-w-[600px] mx-auto">
            <label for="{{ name }}-{{ parentIndex }}-{{ index }}" class="block mb-2 text-sm font-medium text-gray-900">
                {{ label }}
            </label>
            <textarea id="{{ name }}-{{ parentIndex }}-{{ index }}" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      [placeholder]="placeholder || ''"
                      [readonly]="readOnly"
                      [(ngModel)]="value"></textarea>
            <div class="relative">
                <div class="absolute bottom-1.5 right-1.5" *ngIf="speechRecognitionEnabled || speechSynthesisEnabled">
                    <button type="button" class="cursor-pointer text-xl"
                            (click)="speechSynthesisPlayToggle()"
                            title="Voice the text"
                            i18n-title
                            *ngIf="speechSynthesisEnabled">
                        <i class="bi bi-volume-up-fill" [ngClass]="{'text-blue-700': speechSynthesisActive, 'text-gray-700': !speechSynthesisActive}"></i>
                    </button>
                    <button type="button" class="cursor-pointer text-xl ml-3"
                            (click)="microphoneEnableToggle()"
                            title="Voice typing"
                            i18n-title
                            *ngIf="speechRecognitionEnabled">
                        <i class="bi bi-mic-fill text-red-700" *ngIf="microphoneActive"></i>
                        <i class="bi bi-mic-mute-fill text-gray-700" *ngIf="!microphoneActive"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementInputTextComponent {

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
    @Input() value: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    microphoneActive = false;
    speechSynthesisActive = false;
    // @ts-ignore
    recognition: SpeechRecognition;

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    microphoneEnableToggle(): void {
        if (this.editorMode) {
            this.microphoneActive = false;
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
                if (currentValue) {
                    transcripts.unshift(currentValue);
                }
                this.value = transcripts.join('. ') + '.';
                this.cdr.detectChanges();
            });
            this.recognition.addEventListener('end', (event) => {
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
}
