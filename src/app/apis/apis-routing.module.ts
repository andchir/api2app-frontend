import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ApiCreateComponent } from './api-create/api-create.component';
import { ApiSharedComponent } from './api-shared/api-shared.component';

const routes: Routes = [
    {
        path: 'list',
        component: ListComponent
    },
    {
        path: 'create',
        component: ApiCreateComponent
    },
    {
        path: 'edit/:id',
        component: ApiCreateComponent
    },
    {
        path: 'shared/:uuid',
        component: ApiSharedComponent
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApisRoutingModule { }
