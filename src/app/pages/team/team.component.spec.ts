import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { Assignee, Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { TeamComponent } from './team.component';

const sarah: Assignee = { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 's@x.com' };
const john: Assignee = { id: 'user-2', name: 'John Doe', avatar: 'JD', email: 'j@x.com' };

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Write report',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: sarah,
  tags: [],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  ...overrides,
});

function createResource<T>(initial: T) {
  const value = signal(initial);
  const isLoading = signal(false);
  const error = signal<unknown>(undefined);
  return { value, isLoading, error, hasValue: () => !error(), reload: vi.fn() };
}

describe('TeamComponent', () => {
  let fixture: ComponentFixture<TeamComponent>;
  let element: HTMLElement;
  let users: ReturnType<typeof createResource<Assignee[]>>;
  let tasks: ReturnType<typeof createResource<Task[]>>;
  const createUser = vi.fn();

  const cardCounts = () =>
    Array.from(element.querySelectorAll('app-member-card'), (card) =>
      Array.from(card.querySelectorAll('dd'), (count) => count.textContent),
    );

  beforeEach(async () => {
    users = createResource([sarah, john]);
    createUser.mockReset();
    tasks = createResource([
      makeTask({ status: 'todo' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'in_progress', dueDate: '2020-01-01' }),
    ]);

    await TestBed.configureTestingModule({
      imports: [TeamComponent, getTranslocoModule()],
      providers: [
        MessageService,
        { provide: UserService, useValue: { users, createUser } },
        { provide: TaskService, useValue: { tasks } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('refreshes the tasks when the page opens', () => {
    expect(tasks.reload).toHaveBeenCalledOnce();
  });

  it('shows a card per person with their tasks per status and overdue', () => {
    expect(cardCounts()).toEqual([
      ['1', '1', '1', '1'],
      ['0', '0', '0', '0'],
    ]);
  });

  it('updates the counts when the tasks change', async () => {
    tasks.value.set([makeTask({ assignee: john, status: 'done' })]);
    await fixture.whenStable();

    expect(cardCounts()[1]).toEqual(['0', '0', '1', '0']);
  });

  it('shows skeletons during the first load', async () => {
    users.value.set([]);
    users.isLoading.set(true);
    await fixture.whenStable();

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('shows an empty message when there are no team members', async () => {
    users.value.set([]);
    await fixture.whenStable();

    expect(element.querySelector('app-member-card')).toBeNull();
    expect(element.querySelector('.state')).not.toBeNull();
  });

  it('reloads users and tasks when retrying after an error', async () => {
    users.error.set(new Error('Server error'));
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();

    expect(users.reload).toHaveBeenCalledOnce();
    expect(tasks.reload).toHaveBeenCalledTimes(2);
  });

  describe('adding a member', () => {
    const draft = { name: 'Emily Davis', email: 'emily@x.com' };

    it('saves the member, closes the form and confirms it', async () => {
      const addMessage = vi.spyOn(TestBed.inject(MessageService), 'add');
      createUser.mockReturnValue(of({ ...draft, id: 'user-3', avatar: 'ED' }));
      fixture.componentInstance['isAddOpen'].set(true);

      fixture.componentInstance['addMember'](draft);
      await fixture.whenStable();

      expect(createUser).toHaveBeenCalledWith(draft);
      expect(fixture.componentInstance['isAddOpen']()).toBe(false);
      expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('keeps the form open to try again when saving fails', async () => {
      createUser.mockReturnValue(throwError(() => new Error('Server error')));
      fixture.componentInstance['isAddOpen'].set(true);

      fixture.componentInstance['addMember'](draft);
      await fixture.whenStable();

      expect(fixture.componentInstance['isAddOpen']()).toBe(true);
      expect(fixture.componentInstance['isSaving']()).toBe(false);
    });
  });
});
