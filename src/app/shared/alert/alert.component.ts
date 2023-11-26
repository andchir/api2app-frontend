import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: []
})
export class AlertComponent implements OnInit {

    @Input() message = '';
    @Input() type = 'error';

    ngOnInit(): void {

    }
}
