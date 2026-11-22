import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);

    TestBed.tick();
    http.expectOne(url).flush([task]);
    await TestBed.inject(ApplicationRef).whenStable();
  });

  afterEach(() => http.verify());

  it('replaces the task right away and saves the full task', () => {
    const edited: Task = { ...task, title: 'Write the final report', priority: 'high' };

    service.updateTask(edited);

    expect(service.tasks.value()).toEqual([edited]);

    const request = http.expectOne(`${url}/task-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(edited);
    request.flush(edited);
  });

  it('moves a task to a new status, keeping its other fields', () => {
    service.updateStatus('task-1', 'in_progress');

    const moved = service.tasks.value()[0];
    expect(moved.status).toBe('in_progress');
    expect(moved.title).toBe(task.title);

    const request = http.expectOne(`${url}/task-1`);
    expect(request.request.body).toEqual(moved);
    request.flush(moved);
  });

  it('sets the completion date when a task is moved to done', () => {
    service.updateStatus('task-1', 'done');

    expect(service.tasks.value()[0].completedAt).toBeDefined();
    http.expectOne(`${url}/task-1`).flush({});
  });

  it('clears the completion date when a task leaves done', () => {
    service.updateStatus('task-1', 'done');
    http.expectOne(`${url}/task-1`).flush({});

    service.updateStatus('task-1', 'todo');

    expect(service.tasks.value()[0].completedAt).toBeUndefined();
    http.expectOne(`${url}/task-1`).flush({});
  });

  it('puts the task back when saving fails', () => {
    service.updateStatus('task-1', 'done');

    http
      .expectOne(`${url}/task-1`)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(service.tasks.value()[0].status).toBe('todo');
  });

  it('removes a task only after the server deletes it', () => {
    service.deleteTask('task-1').subscribe();

    expect(service.tasks.value()).toEqual([task]);

    const request = http.expectOne(`${url}/task-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});

    expect(service.tasks.value()).toEqual([]);
  });

  it('keeps the task when deleting fails', () => {
    service.deleteTask('task-1').subscribe({ error: vi.fn() });

    http.expectOne(`${url}/task-1`).flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(service.tasks.value()).toEqual([task]);
  });

  describe('from the task form', () => {
    const draft: TaskDraft = {
      title: 'Plan the sprint',
      description: '',
      status: 'todo',
      priority: 'high',
      dueDate: '2099-02-01',
      assignee: task.assignee,
      tags: ['Planning'],
    };

    it('adds a created task only after the server replies', () => {
      service.createTask(draft).subscribe();

      expect(service.tasks.value()).toHaveLength(1);

      const request = http.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush({ ...request.request.body, id: 'task-2' });

      expect(service.tasks.value().map((t) => t.id)).toEqual(['task-2', 'task-1']);
    });

    it('leaves the list unchanged when creating fails', () => {
      service.createTask(draft).subscribe({ error: vi.fn() });

      http.expectOne(url).flush('Server error', { status: 500, statusText: 'Server Error' });

      expect(service.tasks.value()).toEqual([task]);
    });

    it('replaces the task with the saved one', () => {
      service.saveTask(task, draft).subscribe();

      const request = http.expectOne(`${url}/task-1`);
      expect(request.request.method).toBe('PUT');
      expect(request.request.body.title).toBe('Plan the sprint');
      expect(service.tasks.value()[0].title).toBe(task.title);

      request.flush(request.request.body);

      expect(service.tasks.value()[0].title).toBe('Plan the sprint');
    });

    it('sets the completion date when the form moves a task to done', () => {
      service.saveTask(task, { ...draft, status: 'done' }).subscribe();

      const request = http.expectOne(`${url}/task-1`);
      expect(request.request.body.completedAt).toBeDefined();
      request.flush(request.request.body);
    });
  });
});
