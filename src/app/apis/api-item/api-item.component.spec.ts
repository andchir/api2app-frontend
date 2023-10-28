import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiItemComponent } from './api-item.component';

describe('ApiItemComponent', () => {
  let component: ApiItemComponent;
  let fixture: ComponentFixture<ApiItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiItemComponent]
    });
    fixture = TestBed.createComponent(ApiItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
