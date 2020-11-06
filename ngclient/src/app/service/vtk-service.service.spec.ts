import { TestBed } from '@angular/core/testing';

import { VtkServiceService } from './vtk-service.service';

describe('VtkServiceService', () => {
  let service: VtkServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VtkServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
