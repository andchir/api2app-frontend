import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BASE_URL } from '../../environments/environment';

export type PaymentSystemName = 'vk_pay';

export interface PaymentSystemCredentials {
    system_name: PaymentSystemName;
    merchant_id: string;
    merchant_key: string;
    notification_public_key: string;
}

export interface PaymentSystem extends PaymentSystemCredentials {
    id: number;
    date_created: string;
    last_update_time: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentSystemService {

    private readonly requestUrl = `${BASE_URL}api/v1/payment_systems`;

    constructor(private readonly httpClient: HttpClient) {}

    create(credentials: PaymentSystemCredentials): Observable<PaymentSystem> {
        return this.httpClient.post<PaymentSystem>(this.requestUrl, credentials);
    }

    getByName(systemName: PaymentSystemName): Observable<PaymentSystem> {
        return this.httpClient.get<PaymentSystem>(
            `${this.requestUrl}/by-name/${encodeURIComponent(systemName)}`
        );
    }

    update(id: number, credentials: PaymentSystemCredentials): Observable<PaymentSystem> {
        return this.httpClient.patch<PaymentSystem>(`${this.requestUrl}/${id}`, credentials);
    }
}
