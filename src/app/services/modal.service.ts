import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ModalService {

    private viewRef: ViewContainerRef;
    private componentRef: ComponentRef<any>;
    private close$: Subject<string> = new Subject();

    constructor() {}

    get content(): Type<any> {
        return this.componentRef.instance;
    }

    showDynamicComponent(dynamicComponent: Type<any>, data: any, parentView: ViewContainerRef): Subject<string> {
        this.componentRef = this.createComponent(dynamicComponent, parentView);
        for (let prop in data) {
            if (data.hasOwnProperty(prop)) {
                this.componentRef.instance[prop] = data[prop];
            }
        }
        this.componentRef.instance.close
            .subscribe({
                next: (reason) => {
                    this.close$.next(reason);
                    this.removeDynamicComponent();
                }
            });
        return this.close$;
    }

    createComponent(dynamicComponent: Type<any>, parentView: ViewContainerRef): ComponentRef<any> {
        this.removeDynamicComponent();
        this.viewRef = parentView;
        this.removeDynamicComponent();
        return this.viewRef.createComponent(dynamicComponent);
    }

    removeDynamicComponent(): void {
        if (this.viewRef) {
            this.viewRef.clear();
        }
    }
}
