import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { taskOwnerGuard } from './task-owner-guard';

describe('taskOwnerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => taskOwnerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
