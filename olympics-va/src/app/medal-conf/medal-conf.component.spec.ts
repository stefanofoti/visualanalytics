import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalConfComponent } from './medal-conf.component';

describe('MedalConfComponent', () => {
  let component: MedalConfComponent;
  let fixture: ComponentFixture<MedalConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedalConfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedalConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
