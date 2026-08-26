import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    OnInit,
    output,
    signal,
    viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ChatMessage, MessagesService } from '../../../../services/messages.service';
import { SharedModule } from '../../../../shared.module';

@Component({
    selector: 'app-messages-element',
    templateUrl: 'messages-element.component.html',
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
export class MessagesElementComponent implements OnInit, AfterViewChecked, ControlValueAccessor {

    readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

    readonly editorMode = input(false);
    readonly name = input('');
    readonly label = input('');
    readonly placeholder = input('');
    readonly parentIndex = input<number>();
    readonly index = input<number>();
    readonly maxHeight = input(400);
    readonly message = output<string[]>();

    readonly inputText = signal('');
    readonly messages = signal<ChatMessage[]>([]);
    readonly elementId = computed(() =>
        `messages-${this.name()}-${this.parentIndex()}-${this.index()}`
    );

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

    constructor(private readonly messagesService: MessagesService) {}

    ngOnInit(): void {
        this.refreshMessages();
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
            this.messagesService.addMessage(this.elementId(), this.replaceEmojis(text), 'incoming');
            this.refreshMessages();
            this.needsScroll = true;
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
        const text = this.inputText().trim();
        if (!text) {
            return;
        }
        this.messagesService.addMessage(this.elementId(), this.replaceEmojis(text), 'outgoing');
        this.refreshMessages();
        this.inputText.set('');
        this.needsScroll = true;
        this.onChange(MessagesElementComponent.OUTGOING_PREFIX + text);
        this.onTouched();
    }

    undoLastOutgoing(): void {
        this.messagesService.removeLastOutgoing(this.elementId());
        this.refreshMessages();
    }

    clearChat(): void {
        this.messagesService.clearHistory(this.elementId());
        this.refreshMessages();
    }

    private scrollToBottom(): void {
        const el = this.messagesContainer()?.nativeElement;
        if (el) {
            setTimeout(() => {
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }, 50);
        }
    }

    private refreshMessages(): void {
        this.messages.set([...this.messagesService.getHistory(this.elementId())]);
    }

    private replaceEmojis(text: string): string {
        let result = text;
        for (const [pattern, emoji] of MessagesElementComponent.EMOJI_MAP) {
            result = result.replace(pattern, emoji);
        }
        return result;
    }
}
