import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ModalService {

    private viewRef: ViewContainerRef;
    private componentRef: ComponentRef<any>;
    private close$: Subject<string> = new Subject();

    constructor() {}

    get content(): any {
        return this.componentRef.instance;
    }

    showDynamicComponent(parentView: ViewContainerRef, dynamicComponent: Type<any>, data: any): Subject<string> {
        this.componentRef = this.createComponent(parentView, dynamicComponent);
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

    createComponent(parentView: ViewContainerRef, dynamicComponent: Type<any>): ComponentRef<any> {
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
