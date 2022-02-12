import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherChartComponent } from './other-chart.component';

describe('OtherChartComponent', () => {
  let component: OtherChartComponent;
  let fixture: ComponentFixture<OtherChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
