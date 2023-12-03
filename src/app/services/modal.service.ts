import { ApplicationRef, createComponent, EmbeddedViewRef, Inject, Injectable, Injector, Type } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class ModalService {

    constructor(
        private appRef: ApplicationRef,
        private injector: Injector,
        @Inject(DOCUMENT) private document: Document
    )
    {}

    public open(componentType: Type<any>, config: any): any {

        const dialogRef = this.appendDialogComponentToBody(config);

        // this.dialogComponentRefMap.get(dialogRef).instance.childComponentType = componentType;

        return dialogRef;
    }

    private appendDialogComponentToBody(config: any) {
        console.log('appendDialogComponentToBody');

        // const componentRef = createComponent(DynamicDialogComponent, { environmentInjector: this.appRef.injector, elementInjector: new DynamicDialogInjector(this.injector, map) });
        //
        // this.appRef.attachView(componentRef.hostView);
        //
        // const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        //
        // this.document.body.appendChild(domElem);

    }

    private removeDialogComponentFromBody(dialogRef: any) {
        console.log('removeDialogComponentFromBody');

    }
}
