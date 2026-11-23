import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { LanguageService } from '../../core/i18n/language.service';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;

  function makeTask(id: string, createdAt: string): Task {
    return {
      id,
      title: `Task ${id}`,
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '2099-01-01',
      assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
      tags: [],
      createdAt,
      updatedAt: createdAt,
    };
  }

  const tasks = Array.from({ length: 7 }, (_, index) =>
    makeTask(`${index + 1}`, `2026-11-0${index + 1}T10:00:00Z`),
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: LanguageService, useValue: { activeLang: signal('en') } },
        {
          provide: TaskService,
          useValue: { tasks: { hasValue: () => true, value: signal(tasks) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    await fixture.whenStable();
  });

  it('lists the five newest activities, newest first', () => {
    const items = fixture.componentInstance['items']();

    expect(items.map((item) => item.taskTitle)).toEqual([
      'Task 7',
      'Task 6',
      'Task 5',
      'Task 4',
      'Task 3',
    ]);
  });

  it('starts closed', () => {
    const bell = (fixture.nativeElement as HTMLElement).querySelector('.bell')!;

    expect(bell.getAttribute('aria-expanded')).toBe('false');
  });
});
