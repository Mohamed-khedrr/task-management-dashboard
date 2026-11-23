import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Activity } from '../../../../core/models/activity.model';
import { ActivityFeedComponent } from './activity-feed.component';

describe('ActivityFeedComponent', () => {
  let fixture: ComponentFixture<ActivityFeedComponent>;
  let element: HTMLElement;

  const sarah = { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' };
  const activities: Activity[] = [
    {
      id: 'a',
      kind: 'completed',
      taskTitle: 'Fix login',
      assignee: sarah,
      at: '2026-11-21T10:00:00Z',
    },
    {
      id: 'b',
      kind: 'created',
      taskTitle: 'Write report',
      assignee: sarah,
      at: '2026-11-20T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityFeedComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityFeedComponent);
    fixture.componentRef.setInput('activities', activities);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows one entry per activity, in the given order', () => {
    const titles = Array.from(element.querySelectorAll('.task'), (title) =>
      title.textContent?.trim(),
    );

    expect(titles).toEqual(['Fix login', 'Write report']);
  });

  it('gives each entry a machine-readable time', () => {
    const times = Array.from(element.querySelectorAll('time'), (time) =>
      time.getAttribute('datetime'),
    );

    expect(times).toEqual(['2026-11-21T10:00:00Z', '2026-11-20T10:00:00Z']);
  });
});
