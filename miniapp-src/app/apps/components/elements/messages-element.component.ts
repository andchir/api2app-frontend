import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesElementComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;

    @Input() editorMode = false;
    @Input() name: string;
    @Input() label: string;
    @Input() placeholder: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() maxHeight: number = 400;
    @Input() value: any;
    @Input() options: any;
    @Output() elementValueChange: EventEmitter<void> = new EventEmitter<void>();
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();

    inputText = '';
    messages: ChatMessage[] = [];

    private lastOutgoingText = '';
    private needsScroll = false;

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
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']?.currentValue && !changes['value'].firstChange) {
            const text = String(changes['value'].currentValue).trim();
            if (text && text !== this.lastOutgoingText) {
                this.messagesService.addMessage(this.elementId, this.replaceEmojis(text), 'incoming');
                this.messages = this.messagesService.getHistory(this.elementId);
                this.needsScroll = true;
                this.cdr.markForCheck();
            }
            this.lastOutgoingText = '';
        }
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
        this.lastOutgoingText = text;
        this.messagesService.addMessage(this.elementId, this.replaceEmojis(text), 'outgoing');
        this.messages = this.messagesService.getHistory(this.elementId);

        if (this.options) {
            this.options.value = text;
        }
        this.inputText = '';
        this.needsScroll = true;
        this.elementValueChange.emit();
        this.cdr.markForCheck();
    }

    undoLastOutgoing(): void {
        this.messagesService.removeLastOutgoing(this.elementId);
        this.messages = this.messagesService.getHistory(this.elementId);
        this.lastOutgoingText = '';
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
