import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

@Component({
    selector: 'app-element-input-textarea',
    template: `
        <div class="w-full max-w-[600px] mx-auto">
            <label for="{{ options?.name }}-{{ parentIndex }}-{{ index }}" class="block mb-2 text-sm font-medium text-gray-900">
                {{ options?.label }}
            </label>
            <textarea id="{{ options?.name }}-{{ parentIndex }}-{{ index }}" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      [placeholder]="options?.placeholder || ''"
                      [readonly]="options?.readOnly"
                      [(ngModel)]="options.value"></textarea>
            <div class="relative">
                <div class="absolute bottom-1.5 right-1.5">
                    <button type="button" class="cursor-pointer text-xl" (click)="microphoneEnableToggle()">
                        <i class="bi bi-mic-fill text-red-700" *ngIf="microphoneActive"></i>
                        <i class="bi bi-mic-mute-fill" *ngIf="!microphoneActive"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementInputTextAreaComponent implements OnInit, OnChanges {

    @Input() editorMode = false;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() options: any;
    @Output() optionsChange: EventEmitter<any> = new EventEmitter<any>();
    microphoneActive = false;
    // @ts-ignore
    recognition: SpeechRecognition;

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        console.log('INIT', this.options?.type);
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('CHANGES', changes);
    }

    microphoneEnableToggle(): void {
        this.microphoneActive = !this.microphoneActive;
        if (this.microphoneActive) {
            const currentValue = this.options.value.trim();
            this.recognition = new SpeechRecognition();
            this.recognition.lang = window.document.documentElement.lang;
            this.recognition.interimResults = true;
            this.recognition.continuous = true;
            this.recognition.onresult = (event) => {
                const transcripts = Array.from(event.results).map((result) => {
                    return this.capitalize(result[0].transcript.trim());
                });
                this.options.value = currentValue + ' ' + transcripts.join('. ');
                this.cdr.detectChanges();
            };
            this.recognition.onend = (event) => {
                if (this.recognition && this.microphoneActive) {
                    this.recognition.start();
                }
            };
            this.recognition.start();
        } else if (this.recognition) {
            this.recognition.stop();
            this.recognition.abort();
            this.recognition = null;
        }
        this.cdr.detectChanges();
    }

    capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}
