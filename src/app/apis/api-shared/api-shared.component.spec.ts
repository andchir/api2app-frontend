import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiSharedComponent } from './api-shared.component';

describe('ApiCreateComponent', () => {
  let component: ApiSharedComponent;
  let fixture: ComponentFixture<ApiSharedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiSharedComponent]
    });
    fixture = TestBed.createComponent(ApiSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
