import '@angular/localize/init';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AutoScrollOnValueDirective } from './auto-scroll-on-value.directive';
import { AppBlockElement } from '../../apps/models/app-block.interface';


describe('AutoScrollOnValueDirective', () => {

    @Component({
        standalone: false,
        template: '<div [appAutoScrollOnValue]="element"></div>'
    })
    class TestHostComponent {
        element: AppBlockElement = {type: 'text', value: ''};
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let hostElement: HTMLElement;
    let scroll: jasmine.Spy;

    function rectList(): DOMRectList {
        return {length: 1, item: () => null, [0]: {} as DOMRect} as unknown as DOMRectList;
    }

    function renderOutOfView(): void {
        spyOn(hostElement, 'getClientRects').and.returnValue(rectList());
        spyOn(hostElement, 'getBoundingClientRect').and.returnValue({
            top: -10, bottom: 50, left: 0, right: 0, height: 60, width: 100, x: 0, y: -10,
            toJSON: () => null
        } as DOMRect);
    }

    function renderInView(): void {
        spyOn(hostElement, 'getClientRects').and.returnValue(rectList());
        spyOn(hostElement, 'getBoundingClientRect').and.returnValue({
            top: 100, bottom: 200, left: 0, right: 0, height: 100, width: 100, x: 0, y: 100,
            toJSON: () => null
        } as DOMRect);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, AutoScrollOnValueDirective]
        });
        fixture = TestBed.createComponent(TestHostComponent);
        hostElement = fixture.nativeElement.querySelector('div');
        scroll = spyOn(hostElement, 'scrollIntoView');
    });

    afterEach(() => fixture.destroy());

    it('does not scroll for the value present on first render', fakeAsync(() => {
        renderOutOfView();
        fixture.componentInstance.element = {type: 'text', value: 'initial', autoScrollOnValue: true};
        fixture.detectChanges();
        tick(100);
        expect(scroll).not.toHaveBeenCalled();
    }));

    it('scrolls into view when a new value arrives and the option is enabled', fakeAsync(() => {
        fixture.componentInstance.element = {type: 'text', value: '', autoScrollOnValue: true};
        fixture.detectChanges();
        renderOutOfView();
        fixture.componentInstance.element.value = 'new value';
        fixture.detectChanges();
        tick(16);
        expect(scroll).toHaveBeenCalledOnceWith({behavior: 'smooth', block: 'start'});
    }));

    it('does not scroll when the option is disabled', fakeAsync(() => {
        fixture.componentInstance.element = {type: 'text', value: '', autoScrollOnValue: false};
        fixture.detectChanges();
        renderOutOfView();
        fixture.componentInstance.element.value = 'new value';
        fixture.detectChanges();
        tick(16);
        expect(scroll).not.toHaveBeenCalled();
    }));

    it('does not scroll when the new value is empty', fakeAsync(() => {
        fixture.componentInstance.element = {type: 'text', value: 'old', autoScrollOnValue: true};
        fixture.detectChanges();
        renderOutOfView();
        fixture.componentInstance.element.value = '';
        fixture.detectChanges();
        tick(16);
        expect(scroll).not.toHaveBeenCalled();
    }));

    it('scrolls even when the element is already visible, aligning it to the top of the window', fakeAsync(() => {
        fixture.componentInstance.element = {type: 'text', value: '', autoScrollOnValue: true};
        fixture.detectChanges();
        renderInView();
        fixture.componentInstance.element.value = 'new value';
        fixture.detectChanges();
        tick(16);
        expect(scroll).toHaveBeenCalledOnceWith({behavior: 'smooth', block: 'start'});
    }));

    it('waits until the element becomes visible before scrolling', fakeAsync(() => {
        fixture.componentInstance.element = {type: 'text', value: '', autoScrollOnValue: true};
        fixture.detectChanges();
        // No layout while the element is still hidden.
        let hasLayout = false;
        spyOn(hostElement, 'getClientRects').and.callFake(() => hasLayout
            ? ({length: 1, item: () => null, [0]: {} as DOMRect} as unknown as DOMRectList)
            : ({length: 0, item: () => null} as unknown as DOMRectList));
        spyOn(hostElement, 'getBoundingClientRect').and.returnValue({
            top: -10, bottom: 50, left: 0, right: 0, height: 60, width: 100, x: 0, y: -10,
            toJSON: () => null
        } as DOMRect);
        fixture.componentInstance.element.value = 'new value';
        fixture.detectChanges();
        tick(16);
        expect(scroll).not.toHaveBeenCalled();
        hasLayout = true;
        tick(16);
        expect(scroll).toHaveBeenCalledTimes(1);
    }));
});
