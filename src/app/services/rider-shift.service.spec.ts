import { TestBed } from '@angular/core/testing';

import { RiderShiftService } from './rider-shift.service';

describe('RiderShiftService', () => {
  let service: RiderShiftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiderShiftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
