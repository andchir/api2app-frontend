import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ChatMessage, MessagesService } from '../../../services/messages.service';
import { SharedModule } from '../../../shared.module';

@Component({
    selector: 'app-messages-element',
    templateUrl: 'messages-element.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MessagesElementComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesElementComponent implements OnInit, OnDestroy, AfterViewChecked, ControlValueAccessor {

    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;

    @Input() editorMode = false;
    @Input() name: string;
    @Input() label: string;
    @Input() placeholder: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() maxHeight: number = 400;
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();

    inputText = '';
    messages: ChatMessage[] = [];

    private static readonly OUTGOING_PREFIX = '\u200B__out__';
    private needsScroll = false;
    private initialized = false;
    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

    private static readonly EMOJI_MAP: [RegExp, string][] = [
        [/>:\(|>:-\(/g, '😠'],
        [/o:-\)|O:-\)|0:-\)/g, '😇'],
        [/B-\)|B\)/g, '😎'],
        [/:-\*|:\*/g, '😘'],
        [/;-\)|;\)/g, '😉'],
        [/:-D|:D/g, '😁'],
        [/:'-\(|:'\(/g, '😭'],
        [/:-\(|:\(/g, '😢'],
        [/:-\)|:\)/g, '😊'],
        [/:-\||:\|/g, '😐'],
        [/:-O|:O|:-o|:o/g, '😮'],
        [/:-P|:P|:-p|:p/g, '😛'],
        [/<\/3/g, '💔'],
        [/<3/g, '❤️'],
        [/\(y\)/gi, '👍'],
        [/\(n\)/gi, '👎'],
    ];

    constructor(
        private messagesService: MessagesService,
        private cdr: ChangeDetectorRef
    ) {}

    get elementId(): string {
        return `messages-${this.name || ''}-${this.parentIndex}-${this.index}`;
    }

    ngOnInit(): void {
        this.messages = this.messagesService.getHistory(this.elementId);
        this.initialized = true;
    }

    writeValue(value: any): void {
        if (!this.initialized || !value) {
            return;
        }
        const raw = String(value);
        if (raw.startsWith(MessagesElementComponent.OUTGOING_PREFIX)) {
            return;
        }
        const text = raw.trim();
        if (text) {
            this.messagesService.addMessage(this.elementId, this.replaceEmojis(text), 'incoming');
            this.messages = this.messagesService.getHistory(this.elementId);
            this.needsScroll = true;
            this.cdr.markForCheck();
        }
    }

    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    ngAfterViewChecked(): void {
        if (this.needsScroll) {
            this.needsScroll = false;
            this.scrollToBottom();
        }
    }

    sendMessage(): void {
        const text = (this.inputText || '').trim();
        if (!text) {
            return;
        }
        this.messagesService.addMessage(this.elementId, this.replaceEmojis(text), 'outgoing');
        this.messages = this.messagesService.getHistory(this.elementId);
        this.inputText = '';
        this.needsScroll = true;
        this.onChange(MessagesElementComponent.OUTGOING_PREFIX + text);
        this.onTouched();
        this.cdr.markForCheck();
    }

    undoLastOutgoing(): void {
        this.messagesService.removeLastOutgoing(this.elementId);
        this.messages = this.messagesService.getHistory(this.elementId);
        this.cdr.markForCheck();
    }

    private scrollToBottom(): void {
        const el = this.messagesContainer?.nativeElement;
        if (el) {
            setTimeout(() => {
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }, 50);
        }
    }

    private replaceEmojis(text: string): string {
        let result = text;
        for (const [pattern, emoji] of MessagesElementComponent.EMOJI_MAP) {
            result = result.replace(pattern, emoji);
        }
        return result;
    }

    ngOnDestroy(): void {}
}
