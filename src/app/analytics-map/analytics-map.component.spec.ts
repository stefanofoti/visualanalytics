import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsMapComponent } from './analytics-map.component';

describe('AnalyticsMapComponent', () => {
  let component: AnalyticsMapComponent;
  let fixture: ComponentFixture<AnalyticsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
