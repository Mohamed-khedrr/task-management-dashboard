import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Task } from '../../../../core/models/task.model';
import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;

  const baseTask: Task = {
    id: 'task-1',
    title: 'Write report',
    description: '',
    status: 'todo',
    priority: 'high',
    dueDate: '2099-01-01',
    assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
    tags: [],
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  const render = async (task: Task) => {
    fixture.componentRef.setInput('task', task);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
  });

  it('marks a task past its due date as overdue', async () => {
    const card = await render({ ...baseTask, dueDate: '2020-01-01' });

    expect(card.classList).toContain('overdue');
  });

  it('does not mark a done task as overdue, even past its due date', async () => {
    const card = await render({ ...baseTask, status: 'done', dueDate: '2020-01-01' });

    expect(card.classList).not.toContain('overdue');
  });

  it('does not mark a task due in the future as overdue', async () => {
    const card = await render(baseTask);

    expect(card.classList).not.toContain('overdue');
  });

  it('carries its status so the hover color matches the column', async () => {
    const card = await render({ ...baseTask, status: 'in_progress' });

    expect(card.classList).toContain('in_progress');
  });

  it('hides the description when it is empty', async () => {
    const card = await render({ ...baseTask, description: '   ' });

    expect(card.querySelector('.description')).toBeNull();
  });

  it('opens the task when its title is clicked', async () => {
    const card = await render(baseTask);
    const opened = vi.fn();
    fixture.componentInstance.opened.subscribe(opened);

    card.querySelector<HTMLButtonElement>('.open')!.click();

    expect(opened).toHaveBeenCalled();
  });
});
