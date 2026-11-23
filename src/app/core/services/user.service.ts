import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { withRetry } from '../interceptors/retry-interceptor';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';
import { Assignee } from '../models/task.model';
import { MemberDraft } from '../models/team.model';
import { getInitials } from '../utils/name.utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  // Silent: the Team page shows its own error with a Retry button, so a toast would repeat it
  readonly users = httpResource<Assignee[]>(
    () => ({
      url: this.url,
      context: withRetry().set(SILENT_ERRORS, true),
    }),
    { defaultValue: [] },
  );

  /** Adds the member to the list only after the server returns it with its id. */
  createUser(draft: MemberDraft) {
    const newUser: Omit<Assignee, 'id'> = { ...draft, avatar: getInitials(draft.name) };

    return this.http
      .post<Assignee>(this.url, newUser)
      .pipe(tap((created) => this.addCreatedUser(created)));
  }

  // Same reason as TaskService.addCreatedTask: updating a list that failed to load would throw
  private addCreatedUser(created: Assignee) {
    if (this.users.hasValue()) {
      this.users.update((list) => [...list, created]);
    } else {
      this.users.reload();
    }
  }
}
