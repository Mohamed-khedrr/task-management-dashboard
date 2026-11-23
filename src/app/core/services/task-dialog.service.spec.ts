import { TestBed } from '@angular/core/testing';
import { TaskDialogService } from './task-dialog.service';

describe('TaskDialogService', () => {
  let service: TaskDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDialogService);
  });

  it('opens for the task to edit, then empty for a new task', () => {
    service.openEdit('task-1');
    expect(service.isOpen()).toBe(true);
    expect(service.editRequest()?.taskId).toBe('task-1');

    service.close();
    service.openCreate();
    expect(service.isOpen()).toBe(true);
    expect(service.editRequest()).toBeNull();
  });

  it('asks for the task again when the same one is opened twice', () => {
    service.openEdit('task-1');
    const first = service.editRequest();

    service.openEdit('task-1');

    expect(service.editRequest()).not.toBe(first);
  });
});
