import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EconChartComponent } from './econ-chart.component';

describe('EconChartComponent', () => {
  let component: EconChartComponent;
  let fixture: ComponentFixture<EconChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EconChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EconChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
