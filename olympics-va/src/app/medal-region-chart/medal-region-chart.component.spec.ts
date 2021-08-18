import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalRegionChartComponent } from './medal-region-chart.component';

describe('MedalRegionChartComponent', () => {
  let component: MedalRegionChartComponent;
  let fixture: ComponentFixture<MedalRegionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedalRegionChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedalRegionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
