import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { ApplicationSharedComponent } from './apps/app-shared/app-shared.component';

const routes: Routes = [
    {
        path: '',
        component: ApplicationSharedComponent,
        title: $localize `Create an application simply online`
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
