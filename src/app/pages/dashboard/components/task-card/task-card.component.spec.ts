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

  it('offers Edit and Delete from the actions menu', async () => {
    const card = await render(baseTask);
    const edit = vi.fn();
    const remove = vi.fn();
    fixture.componentInstance.editRequested.subscribe(edit);
    fixture.componentInstance.deleteRequested.subscribe(remove);

    card.querySelector<HTMLButtonElement>('.menu-button')!.click();
    await fixture.whenStable();

    const items = Array.from(document.querySelectorAll<HTMLElement>('.p-menu-item-link'));
    items.find((item) => item.textContent?.includes('Edit'))!.click();
    expect(edit).toHaveBeenCalled();

    card.querySelector<HTMLButtonElement>('.menu-button')!.click();
    await fixture.whenStable();
    Array.from(document.querySelectorAll<HTMLElement>('.p-menu-item-link'))
      .find((item) => item.textContent?.includes('Delete'))!
      .click();
    expect(remove).toHaveBeenCalled();
  });

  describe('long descriptions', () => {
    // jsdom has no layout, so the heights a cut-off description would have are faked
    const fakeHeights = (fullHeight: number, visibleHeight: number) => {
      vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(fullHeight);
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(visibleHeight);
    };

    const renderLong = async () => {
      await render({ ...baseTask, description: 'A long description' });
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    };

    afterEach(() => vi.restoreAllMocks());

    it('offers Show more only when the text is cut', async () => {
      fakeHeights(60, 60);
      const card = await renderLong();

      expect(card.querySelector('.show-more')).toBeNull();
    });

    it('expands and collapses the description', async () => {
      fakeHeights(120, 60);
      const card = await renderLong();
      const toggle = card.querySelector<HTMLButtonElement>('.show-more')!;

      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(card.querySelector('.description')!.classList).toContain('collapsed');

      toggle.click();
      await fixture.whenStable();

      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(card.querySelector('.description')!.classList).not.toContain('collapsed');

      toggle.click();
      await fixture.whenStable();

      expect(card.querySelector('.description')!.classList).toContain('collapsed');
    });
  });
});
