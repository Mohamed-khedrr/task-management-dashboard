import { TestBed } from '@angular/core/testing';
import { createMemoryStorage } from '../../../testing/memory-storage';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const createService = () => {
    TestBed.resetTestingModule();
    return TestBed.inject(ProfileService);
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  it('builds initials from the first and last name', () => {
    const service = createService();

    service.setName('mohamed ali khedr');
    expect(service.initials()).toBe('MK');

    service.setName('  Sarah  ');
    expect(service.initials()).toBe('S');
  });

  it('has no initials until a name is saved', () => {
    expect(createService().initials()).toBe('');
  });

  it('keeps the saved name after a reload', () => {
    createService().setName(' Sarah Smith ');

    const reloaded = createService();

    expect(reloaded.name()).toBe('Sarah Smith');
    expect(reloaded.initials()).toBe('SS');
  });
});
