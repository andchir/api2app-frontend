import '@angular/localize/init';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProgressElementComponent } from './progress-element.component';

describe('ProgressElementComponent polling', () => {
    let fixture: ComponentFixture<ProgressElementComponent>;
    let component: ProgressElementComponent;
    let storage: Map<string, string>;

    function update(data: any): void {
        setInput('dataJson', JSON.stringify(data));
    }

    function setInput(name: string, value: unknown): void {
        fixture.componentRef.setInput(name, value);
        fixture.detectChanges();
    }

    beforeEach(() => {
        storage = new Map();
        spyOn(Storage.prototype, 'getItem').and.callFake(key => storage.get(key) ?? null);
        spyOn(Storage.prototype, 'setItem').and.callFake((key, value) => { storage.set(key, value); });
        spyOn(Storage.prototype, 'removeItem').and.callFake(key => { storage.delete(key); });
        TestBed.configureTestingModule({ imports: [ProgressElementComponent] });
        fixture = TestBed.createComponent(ProgressElementComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('operationDurationSeconds', 100);
    });

    afterEach(() => fixture.destroy());

    it('keeps a ten-second polling interval despite frequent responses', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit');
        update({ uuid: 'a', status: 'processing' });
        for (let second = 1; second <= 30; second++) {
            tick(1000);
            update({ uuid: 'a', status: 'processing', timestamp: second });
            expect(poll).toHaveBeenCalledTimes(Math.floor(second / 10));
            expect(component.value()).toBe(second);
        }
        fixture.destroy();
    }));

    it('ignores unrelated input changes', fakeAsync(() => {
        update({ uuid: 'a' });
        const updated = spyOn<any>(component, 'onDataUpdated').and.callThrough();
        setInput('index', 1);
        expect(updated).not.toHaveBeenCalled();
        fixture.destroy();
    }));

    it('does not restart the timer after a synchronous completion response', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit').and.callFake(() => {
            update({ uuid: 'a', status: 'completed' });
        });
        const completed = spyOn(component.progressCompleted, 'emit');
        update({ uuid: 'a' });
        tick(30000);
        update({ uuid: 'a', status: 'completed', timestamp: 1 });
        expect(poll).toHaveBeenCalledTimes(1);
        expect(completed).toHaveBeenCalledTimes(1);
        expect(component.value()).toBe(100);
    }));

    it('emits errors only once for repeated terminal responses', fakeAsync(() => {
        const message = spyOn(component.message, 'emit');
        update({ uuid: 'a', status: 'error', result_data: { message: 'failed' } });
        update({ uuid: 'a', status: 'error', result_data: { message: 'failed' }, timestamp: 1 });
        expect(message).toHaveBeenCalledOnceWith(['failed', 'error']);
        tick(1);
    }));

    it('keeps cancellation terminal and permits a new task', fakeAsync(() => {
        const completed = spyOn(component.progressCompleted, 'emit');
        const poll = spyOn(component.progressUpdate, 'emit').and.callFake(() => component.cancel());
        update({ uuid: 'a' });
        tick(10000);
        update({ uuid: 'a', status: 'processing' });
        component.cancel();
        tick(20000);
        expect(component.status()).toBe('canceled');
        expect(poll).toHaveBeenCalledTimes(1);
        expect(completed).toHaveBeenCalledTimes(1);
        update({ uuid: 'b' });
        expect(component.status()).toBe('processing');
        expect(component.value()).toBe(0);
        tick(10000);
        expect(poll).toHaveBeenCalledTimes(2);
    }));

    it('starts progress when leaving a pending queue without resetting the poll deadline', fakeAsync(() => {
        fixture.componentRef.setInput('statusPending', 'pending');
        const poll = spyOn(component.progressUpdate, 'emit');
        update({ uuid: 'a', status: 'pending', number: '0' });
        tick(5000);
        expect(component.value()).toBe(0);
        update({ uuid: 'a', status: 'processing', number: '0' });
        tick(5000);
        expect(component.value()).toBe(5);
        expect(poll).toHaveBeenCalledTimes(1);
        fixture.destroy();
    }));

    it('restores each task start time independently', fakeAsync(() => {
        storage.set('a-progress-start', new Date(Date.now() - 20000).toISOString());
        storage.set('b-progress-start', new Date(Date.now() - 5000).toISOString());
        update({ uuid: 'a' });
        expect(component.value()).toBe(20);
        update({ uuid: 'b' });
        expect(component.value()).toBe(5);
        fixture.destroy();
    }));

    it('stops on malformed or cleared JSON and resumes on valid data', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit');
        update({ uuid: 'a' });
        expect(() => setInput('dataJson', '{')).not.toThrow();
        tick(20000);
        expect(poll).not.toHaveBeenCalled();
        update({ uuid: 'a' });
        tick(10000);
        expect(poll).toHaveBeenCalledTimes(1);
        setInput('dataJson', null);
        tick(20000);
        expect(poll).toHaveBeenCalledTimes(1);
    }));

    it('tolerates unavailable storage and invalid durations', fakeAsync(() => {
        (Storage.prototype.getItem as jasmine.Spy).and.throwError('blocked');
        (Storage.prototype.setItem as jasmine.Spy).and.throwError('blocked');
        (Storage.prototype.removeItem as jasmine.Spy).and.throwError('blocked');
        fixture.componentRef.setInput('operationDurationSeconds', 0);
        update({ uuid: 'a' });
        tick(1000);
        expect(component.value()).toBe(0);
        setInput('operationDurationSeconds', NaN);
        tick(1000);
        expect(component.value()).toBe(0);
        component.cancel();
    }));

    it('does not rearm polling when destroyed by an event subscriber', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit').and.callFake(() => fixture.destroy());
        update({ uuid: 'a' });
        tick(30000);
        expect(poll).toHaveBeenCalledTimes(1);
    }));

    it('permits a new run without a task ID after the input is cleared', fakeAsync(() => {
        const completed = spyOn(component.progressCompleted, 'emit');
        update({ status: 'completed' });
        update(null);
        update({ status: 'processing' });
        tick(1000);
        expect(component.value()).toBe(1);
        update({ status: 'completed' });
        expect(completed).toHaveBeenCalledTimes(2);
    }));

    it('stops polling when entering editor mode', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit');
        update({ uuid: 'a' });
        setInput('editorMode', true);
        tick(20000);
        expect(poll).not.toHaveBeenCalled();
        expect(component.value()).toBe(65);
    }));

    it('does not rerun the input effect on progress ticks', fakeAsync(() => {
        update({ uuid: 'a' });
        const updated = spyOn<any>(component, 'onDataUpdated').and.callThrough();
        tick(5000);
        fixture.detectChanges();
        expect(component.value()).toBe(5);
        expect(updated).not.toHaveBeenCalled();
        fixture.destroy();
    }));

    it('renders queue, completion and cancellation with the signal state', fakeAsync(() => {
        update({ uuid: 'a', number: 3 });
        expect(fixture.nativeElement.querySelector('b').textContent).toBe('3');
        update({ uuid: 'a', status: 'completed' });
        expect(fixture.nativeElement.querySelector('b')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Done');
        expect(fixture.nativeElement.querySelector('button')).toBeNull();
        update({ uuid: 'b', status: 'processing' });
        fixture.nativeElement.querySelector('button').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Canceled');
        expect(fixture.nativeElement.querySelector('button')).toBeNull();
        tick(1);
    }));

    it('supports the value input and form writes without emitting changes', fakeAsync(() => {
        const changed = jasmine.createSpy('changed');
        component.registerOnChange(changed);
        const valueChange = spyOn(component.valueChange, 'emit');
        setInput('value', 42);
        expect(component.value()).toBe(42);
        component.writeValue(73);
        fixture.detectChanges();
        expect(component.value()).toBe(73);
        setInput('editorMode', true);
        expect(component.value()).toBe(65);
        setInput('editorMode', false);
        expect(component.value()).toBe(73);
        expect(changed).not.toHaveBeenCalled();
        expect(valueChange).not.toHaveBeenCalled();
        tick(1);
    }));

    it('accepts object input and lets an explicit JSON clear take precedence', fakeAsync(() => {
        const poll = spyOn(component.progressUpdate, 'emit');
        setInput('data', { uuid: 'a' });
        tick(1000);
        expect(component.value()).toBe(1);
        setInput('dataJson', null);
        tick(20000);
        expect(poll).not.toHaveBeenCalled();
        expect(component.value()).toBe(0);
    }));

});
