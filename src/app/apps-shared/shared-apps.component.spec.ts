import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedAppsComponent } from './shared-apps.component';

describe('DashboardComponent', () => {
  let component: SharedAppsComponent;
  let fixture: ComponentFixture<SharedAppsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SharedAppsComponent]
    });
    fixture = TestBed.createComponent(SharedAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
