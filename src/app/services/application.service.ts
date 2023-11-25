import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';

const BASE_URL = environment.apiUrl;

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

    constructor(
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}apps_items`;
    }

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false
        };
    }
}
