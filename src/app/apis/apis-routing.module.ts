import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ApiCreateComponent } from './api-create/api-create.component';
import { ApiSharedComponent } from './api-shared/api-shared.component';
import { ListPersonalComponent } from './list/personal/personal.component';
import { ListSharedComponent } from './list/shared/shared.component';

const routes: Routes = [
    {
        path: '',
        component: ListComponent,
        children: [
            {
                path: '',
                redirectTo: 'shared',
                pathMatch: 'full'
            },
            {
                path: 'shared',
                component: ListSharedComponent
            },
            {
                path: 'personal',
                component: ListPersonalComponent
            }
        ]
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
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApisRoutingModule { }
