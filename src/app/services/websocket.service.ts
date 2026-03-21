import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

export interface WebSocketInboundMessage {
    url: string;
    data: unknown;
}

@Injectable({providedIn: 'root'})
export class WebsocketService {

    private readonly sockets = new Map<string, WebSocket>();

    readonly message$ = new Subject<WebSocketInboundMessage>();

    readonly open$ = new Subject<string>();

    readonly close$ = new Subject<{ url: string; code: number; reason: string }>();

    readonly error$ = new Subject<{ url: string; event: Event }>();

    connect(url: string): void {
        const previous = this.sockets.get(url);
        if (previous) {
            previous.close();
        }

        // DEBUG(ws): remove after debugging
        console.log('[WS debug] connect', url);

        const ws = new WebSocket(url);
        this.sockets.set(url, ws);

        ws.onopen = () => {
            // DEBUG(ws): remove after debugging
            console.log('[WS debug] open', url);
            this.open$.next(url);
        };

        ws.onmessage = (event: MessageEvent) => {
            let data: unknown = event.data;
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data) as unknown;
                } catch {
                    /* keep as string */
                }
            }
            // DEBUG(ws): remove after debugging
            console.log('[WS debug] inbound', {url, raw: event.data, data});
            this.message$.next({url, data});
        };

        ws.onerror = (event: Event) => {
            // DEBUG(ws): remove after debugging
            console.log('[WS debug] error event', {url, event});
            this.error$.next({url, event});
        };

        ws.onclose = (event: CloseEvent) => {
            if (this.sockets.get(url) === ws) {
                this.sockets.delete(url);
            }
            // DEBUG(ws): remove after debugging
            console.log('[WS debug] close', {url, code: event.code, reason: event.reason});
            this.close$.next({url, code: event.code, reason: event.reason});
        };
    }

    disconnect(url?: string): void {
        if (url !== undefined) {
            this.closeOne(url);
            return;
        }
        for (const u of [...this.sockets.keys()]) {
            this.closeOne(u);
        }
    }

    sendJson(url: string, payload: unknown): void {
        const ws = this.sockets.get(url);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error(`WebSocket is not open for ${url}`);
        }
        const out = JSON.stringify(payload);
        // DEBUG(ws): remove after debugging
        console.log('[WS debug] sendJson', {url, payload});
        ws.send(out);
    }

    sendText(url: string, text: string): void {
        const ws = this.sockets.get(url);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error(`WebSocket is not open for ${url}`);
        }
        // DEBUG(ws): remove after debugging
        console.log('[WS debug] sendText', {url, text});
        ws.send(text);
    }

    isConnected(url: string): boolean {
        const ws = this.sockets.get(url);
        return ws !== undefined && ws.readyState === WebSocket.OPEN;
    }

    private closeOne(url: string): void {
        const ws = this.sockets.get(url);
        if (!ws) {
            return;
        }
        ws.close();
    }
}
