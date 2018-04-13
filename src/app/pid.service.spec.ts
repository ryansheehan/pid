import { TestBed, inject } from '@angular/core/testing';

import { PidService } from './pid.service';

describe('PidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PidService]
    });
  });

  it('should be created', inject([PidService], (service: PidService) => {
    expect(service).toBeTruthy();
  }));
});
