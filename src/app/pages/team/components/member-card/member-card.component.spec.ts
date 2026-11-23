import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { TeamMember } from '../../../../core/models/team.model';
import { MemberCardComponent } from './member-card.component';

describe('MemberCardComponent', () => {
  let fixture: ComponentFixture<MemberCardComponent>;

  const member: TeamMember = {
    user: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
    counts: { todo: 2, in_progress: 1, done: 5 },
    overdue: 0,
  };

  const render = async (value: TeamMember) => {
    fixture.componentRef.setInput('member', value);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberCardComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberCardComponent);
  });

  it('shows the task count for each status and overdue', async () => {
    const card = await render({ ...member, overdue: 3 });
    const counts = Array.from(card.querySelectorAll('dd'), (count) => count.textContent);

    expect(counts).toEqual(['2', '1', '5', '3']);
  });

  it('lets the user email the person', async () => {
    const card = await render(member);

    expect(card.querySelector('a')?.getAttribute('href')).toBe('mailto:sarah@example.com');
  });

  it('highlights overdue only when the person has overdue tasks', async () => {
    let card = await render(member);
    expect(card.querySelector('.overdue')).toBeNull();

    card = await render({ ...member, overdue: 1 });
    expect(card.querySelector('.overdue')).not.toBeNull();
  });
});
