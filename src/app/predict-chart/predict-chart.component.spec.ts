import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictChartComponent } from './predict-chart.component';

describe('PredictChartComponent', () => {
  let component: PredictChartComponent;
  let fixture: ComponentFixture<PredictChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
