import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';

const routes: Routes = [
    {
        path: 'list',
        component: ListComponent
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
