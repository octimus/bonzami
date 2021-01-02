import { TestBed } from '@angular/core/testing';

import { ApiKinuService } from './api-kinu.service';

describe('ApiKinuService', () => {
  let service: ApiKinuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiKinuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
