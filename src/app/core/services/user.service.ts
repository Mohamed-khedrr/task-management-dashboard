import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { withRetry } from '../interceptors/retry-interceptor';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';
import { Assignee } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Silent: the Team page shows its own error with a Retry button, so a toast would repeat it
  readonly users = httpResource<Assignee[]>(
    () => ({
      url: `${environment.apiUrl}/users`,
      context: withRetry().set(SILENT_ERRORS, true),
    }),
    { defaultValue: [] },
  );
}
