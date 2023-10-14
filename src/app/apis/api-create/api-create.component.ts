import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subject} from 'rxjs';

@Component({
  selector: 'app-api-create',
  templateUrl: './api-create.component.html',
  styleUrls: ['./api-create.component.css']
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    data = {
        name: '',
        requestMethod: 'GET',
        requestUrl: 'http://httpbin.org/get',
        basicAuth: false
    };
    requestMethods = [
        'POST', 'GET', 'PUT', 'HEAD', 'DELETE', 'PATCH', 'PURGE', 'OPTIONS'
    ];
    destroyed$: Subject<void> = new Subject();

    constructor(

    ) {}

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    saveData(): void {
        console.log('saveDate', this.data);
    }

    apiSendRequest(): void {
        console.log('apiSendRequest', this.data);
    }

    requestMethodUpdate(method: string): void {
        this.data.requestMethod = method;
    }
}
