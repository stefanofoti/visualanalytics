import { TestBed } from '@angular/core/testing';

import { AnalyticsLoaderService } from './analytics-loader.service';

describe('AnalyticsLoaderService', () => {
  let service: AnalyticsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
