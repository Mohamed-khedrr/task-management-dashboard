import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';
import { RETRY_CONTEXT } from '../interceptors/retry-interceptor';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the users with retries and without an error toast', async () => {
    TestBed.tick();
    const request = http.expectOne(`${environment.apiUrl}/users`);

    expect(request.request.context.get(RETRY_CONTEXT)).toBe(true);
    expect(request.request.context.get(SILENT_ERRORS)).toBe(true);

    request.flush([{ id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 's@x.com' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.users.value()).toHaveLength(1);
  });
});
