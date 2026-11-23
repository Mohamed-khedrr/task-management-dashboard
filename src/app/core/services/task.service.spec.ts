import { HttpResourceRef, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ApplicationRef,
  createEnvironmentInjector,
  EnvironmentInjector,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';
import { RETRY_CONTEXT } from '../interceptors/retry-interceptor';
import { Task, TaskDraft } from '../models/task.model';
import { TaskService } from './task.service';

describe('TaskService', () => {
  const url = `${environment.apiUrl}/tasks`;
  let service: TaskService;
  let http: HttpTestingController;

  const task: Task = {
    id: 'task-1',
    title: 'Write report',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '2099-01-01',
    assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
    tags: [],
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  const draft: TaskDraft = {
    title: 'Plan the sprint',
    description: '',
    status: 'todo',
    priority: 'high',
    dueDate: '2099-02-01',
    assignee: task.assignee,
    tags: ['Planning'],
  };

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  // A page's list, created in its own injector so the test can close the page
  const openPage = async (tasks: Task[] = [task]) => {
    const page = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const list = page.runInContext(() => service.createTasksResource());
    TestBed.tick();
    const request = http.expectOne({ method: 'GET', url });
    request.flush(tasks);
    await settle();
    return { page, list, request };
  };

  const expectListReload = async (list: HttpResourceRef<Task[]>, tasks: Task[]) => {
    TestBed.tick();
    http.expectOne({ method: 'GET', url }).flush(tasks);
    await settle();
    expect(list.value()).toEqual(tasks);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('page task lists', () => {
    it('load with retries and without an error toast', async () => {
      const { list, request } = await openPage();

      expect(request.request.context.get(RETRY_CONTEXT)).toBe(true);
      expect(request.request.context.get(SILENT_ERRORS)).toBe(true);
      expect(list.value()).toEqual([task]);
    });

    it('load again after a successful change, keeping the old list on screen meanwhile', async () => {
      const { list } = await openPage();

      service.deleteTask('task-1').subscribe();
      http.expectOne({ method: 'DELETE', url: `${url}/task-1` }).flush(null);
      TestBed.tick();

      expect(list.value()).toEqual([task]);
      await expectListReload(list, []);
    });

    it('stay as they are when a change fails', async () => {
      const { list } = await openPage();

      service.deleteTask('task-1').subscribe({ error: vi.fn() });
      http.expectOne(`${url}/task-1`).flush('down', { status: 500, statusText: 'Server Error' });
      TestBed.tick();

      http.expectNone({ method: 'GET', url });
      expect(list.value()).toEqual([task]);
    });

    it('stop reloading once their page is closed', async () => {
      const { page } = await openPage();
      page.destroy();

      service.deleteTask('task-1').subscribe();
      http.expectOne(`${url}/task-1`).flush(null);
      TestBed.tick();

      http.expectNone({ method: 'GET', url });
    });

    it('recover after a failed load when a task is created', async () => {
      const page = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      const list = page.runInContext(() => service.createTasksResource());
      TestBed.tick();
      http.expectOne(url).flush('down', { status: 500, statusText: 'Server Error' });
      await settle();

      const onSaved = vi.fn();
      service.createTask(draft).subscribe({ next: onSaved });
      const created = http.expectOne({ method: 'POST', url });
      created.flush({ ...created.request.body, id: 'task-2' });

      expect(onSaved).toHaveBeenCalledOnce();
      await expectListReload(list, [task]);
    });
  });

  describe('changes', () => {
    it('creates a task with its dates set', () => {
      service.createTask({ ...draft, status: 'done' }).subscribe();

      const request = http.expectOne({ method: 'POST', url });
      expect(request.request.body.title).toBe('Plan the sprint');
      expect(request.request.body.createdAt).toBeDefined();
      expect(request.request.body.completedAt).toBeDefined();
      request.flush({});
    });

    it('saves the form changes onto the task', () => {
      service.saveTask(task, draft).subscribe();

      const request = http.expectOne({ method: 'PUT', url: `${url}/task-1` });
      expect(request.request.body).toMatchObject({ id: 'task-1', title: 'Plan the sprint' });
      request.flush(request.request.body);
    });

    it('saves a moved card without reloading the open lists', async () => {
      await openPage();

      service.updateStatus(task, 'done').subscribe();
      const request = http.expectOne({ method: 'PUT', url: `${url}/task-1` });
      request.flush(request.request.body);
      TestBed.tick();

      http.expectNone({ method: 'GET', url });
    });

    it('moves a task to a new status, keeping its other fields', () => {
      service.updateStatus(task, 'in_progress').subscribe();

      const request = http.expectOne({ method: 'PUT', url: `${url}/task-1` });
      const { updatedAt, ...unchanged } = task;
      expect(request.request.body).toMatchObject({ ...unchanged, status: 'in_progress' });
      expect(request.request.body.updatedAt).not.toBe(updatedAt);
      expect(request.request.context.get(RETRY_CONTEXT)).toBe(true);
      request.flush(request.request.body);
    });

    it('sets the completion date when a task becomes done and clears it when it leaves', () => {
      service.updateStatus(task, 'done').subscribe();
      const done = http.expectOne(`${url}/task-1`);
      expect(done.request.body.completedAt).toBeDefined();
      done.flush(done.request.body);

      service.updateStatus(done.request.body, 'todo').subscribe();
      const reopened = http.expectOne(`${url}/task-1`);
      expect(reopened.request.body.completedAt).toBeUndefined();
      reopened.flush(reopened.request.body);
    });
  });

  describe('the task being edited', () => {
    it('loads one task, and loads it again when it is opened again', async () => {
      const editRequest = signal<{ taskId: string } | null>(null);
      const edited = TestBed.runInInjectionContext(() => service.createTaskResource(editRequest));
      TestBed.tick();
      http.expectNone(`${url}/task-1`);

      editRequest.set({ taskId: 'task-1' });
      TestBed.tick();
      http.expectOne(`${url}/task-1`).flush(task);
      await settle();
      expect(edited.value()).toEqual(task);

      editRequest.set({ taskId: 'task-1' });
      TestBed.tick();
      http.expectOne(`${url}/task-1`).flush({ ...task, title: 'Changed elsewhere' });
      await settle();
      expect(edited.value()?.title).toBe('Changed elsewhere');
    });
  });
});
