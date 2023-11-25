import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';
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
            // {
            //     path: 'personal',
            //     component: ListPersonalComponent
            // }
        ]
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
export class AppsRoutingModule { }
