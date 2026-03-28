import { Injectable } from '@angular/core';

export interface ChatMessage {
    text: string;
    direction: 'incoming' | 'outgoing';
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    private histories: Map<string, ChatMessage[]> = new Map();

    getHistory(elementId: string): ChatMessage[] {
        if (!this.histories.has(elementId)) {
            this.histories.set(elementId, []);
        }
        return this.histories.get(elementId)!;
    }

    addMessage(elementId: string, text: string, direction: 'incoming' | 'outgoing'): void {
        const history = this.getHistory(elementId);
        history.push({ text, direction, timestamp: new Date() });
    }

    removeLastOutgoing(elementId: string): void {
        const history = this.getHistory(elementId);
        const lastOutgoingIndex = [...history].reverse().findIndex(m => m.direction === 'outgoing');
        if (lastOutgoingIndex !== -1) {
            history.splice(history.length - 1 - lastOutgoingIndex, 1);
        }
    }

    clearHistory(elementId: string): void {
        this.histories.set(elementId, []);
    }

    clearAll(): void {
        this.histories.clear();
    }
}
