import { TestBed } from '@angular/core/testing';

import { NgxPresenceAuthService } from './ngx-presence-auth.service';

describe('NgxPresenceAuthService', () => {
  let service: NgxPresenceAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPresenceAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
