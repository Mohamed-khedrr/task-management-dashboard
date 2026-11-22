import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { withRetry } from '../interceptors/retry-interceptor';
import { Assignee } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly users = httpResource<Assignee[]>(
    () => ({ url: `${environment.apiUrl}/users`, context: withRetry() }),
    { defaultValue: [] },
  );
}
