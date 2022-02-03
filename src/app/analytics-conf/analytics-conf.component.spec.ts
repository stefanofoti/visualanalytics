import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsConfComponent } from './analytics-conf.component';

describe('AnalyticsConfComponent', () => {
  let component: AnalyticsConfComponent;
  let fixture: ComponentFixture<AnalyticsConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsConfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
