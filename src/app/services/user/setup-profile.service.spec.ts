import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SetupProfileService } from './setup-profile.service';

describe('SetupProfileService', () => {
  let service: SetupProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SetupProfileService]
    });
    service = TestBed.inject(SetupProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
