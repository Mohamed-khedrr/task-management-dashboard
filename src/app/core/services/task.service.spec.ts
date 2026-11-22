import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model';
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
});
