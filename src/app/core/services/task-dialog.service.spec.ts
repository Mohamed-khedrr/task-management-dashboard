import { TestBed } from '@angular/core/testing';
import { Task } from '../models/task.model';
import { TaskDialogService } from './task-dialog.service';

describe('TaskDialogService', () => {
  let service: TaskDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDialogService);
  });

  it('opens with the task to edit, then empty for a new task', () => {
    const task = { id: 'task-1' } as Task;

    service.openEdit(task);
    expect(service.isOpen()).toBe(true);
    expect(service.task()).toBe(task);

    service.close();
    service.openCreate();
    expect(service.isOpen()).toBe(true);
    expect(service.task()).toBeNull();
  });
});
