import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ListApisComponent } from '../../apis/list/list.component';
import { RouterEventsService } from '../../services/router-events.service';

@Component({
  selector: 'app-apps-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListAppsComponent extends ListApisComponent {

    constructor(
        routerEventsService: RouterEventsService,
        route: ActivatedRoute,
        router: Router
    ) {
        super(routerEventsService, route, router);
    }
}
