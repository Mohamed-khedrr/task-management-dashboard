import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Assignee, Task, TaskDraft } from '../../../../core/models/task.model';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let element: HTMLElement;
  let saved: TaskDraft[];

  const sarah: Assignee = {
    id: 'user-1',
    name: 'Sarah Smith',
    avatar: 'SS',
    email: 'sarah@example.com',
  };

  const task: Task = {
    id: 'task-1',
    title: 'Write report',
    description: 'Quarterly numbers',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2020-01-01',
    assignee: sarah,
    tags: ['Docs'],
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  const setup = async (inputs: { task?: Task; saving?: boolean } = {}) => {
    fixture = TestBed.createComponent(TaskFormComponent);
    fixture.componentRef.setInput('users', [sarah]);
    fixture.componentRef.setInput('task', inputs.task ?? null);
    fixture.componentRef.setInput('saving', inputs.saving ?? false);
    fixture.componentInstance.saved.subscribe((draft) => saved.push(draft));
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  const field = (selector: string) => element.querySelector<HTMLInputElement>(selector)!;

  const type = async (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const submit = async () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  };

  // The select and the tags input are PrimeNG widgets, so they're set through the form
  const form = () => fixture.componentInstance['form'];

  const chooseAssignee = async () => {
    form().controls.assigneeId.setValue(sarah.id);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    saved = [];
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, getTranslocoModule()],
    }).compileComponents();
  });

  it('does not save an empty form and marks the required fields invalid', async () => {
    await setup();

    await submit();

    expect(saved).toEqual([]);
    expect(field('#task-title').getAttribute('aria-invalid')).toBe('true');
    expect(field('#task-due-date').getAttribute('aria-invalid')).toBe('true');
  });

  it('does not accept a title made of spaces', async () => {
    await setup();
    await type(field('#task-title'), '   ');
    await type(field('#task-due-date'), '2099-01-01');
    await chooseAssignee();

    await submit();

    expect(saved).toEqual([]);
  });

  it('saves a trimmed draft with the full assignee', async () => {
    await setup();
    await type(field('#task-title'), '  Plan the sprint  ');
    await type(field('#task-due-date'), '2099-01-01');
    await chooseAssignee();

    await submit();

    expect(saved).toEqual([
      {
        title: 'Plan the sprint',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '2099-01-01',
        assignee: sarah,
        tags: [],
      },
    ]);
  });

  it('fills the form from the task being edited and saves it unchanged', async () => {
    await setup({ task });

    expect(field('#task-title').value).toBe('Write report');

    await submit();

    expect(saved).toEqual([
      {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: sarah,
        tags: ['Docs'],
      },
    ]);
  });

  it('blocks saving a tag longer than 20 characters', async () => {
    await setup({ task });

    form().controls.tags.setValue(['Docs', 'a'.repeat(21)]);
    await submit();

    expect(saved).toEqual([]);
  });

  it('drops empty tags and trims the rest', async () => {
    await setup({ task });

    form().controls.tags.setValue([' Docs ', '  ']);
    await submit();

    expect(saved[0].tags).toEqual(['Docs']);
  });

  it('does not save again while a save is in progress', async () => {
    await setup({ task, saving: true });

    await submit();

    expect(saved).toEqual([]);
  });
});
