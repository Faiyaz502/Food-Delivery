import { TestBed } from '@angular/core/testing';

import { OrderReportService } from './order-report.service';

describe('OrderReportService', () => {
  let service: OrderReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
