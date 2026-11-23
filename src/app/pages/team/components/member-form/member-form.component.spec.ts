import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { MemberFormComponent } from './member-form.component';

describe('MemberFormComponent', () => {
  let fixture: ComponentFixture<MemberFormComponent>;
  let element: HTMLElement;
  const onSaved = vi.fn();

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;

  const type = async (id: string, value: string) => {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const submit = async () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    onSaved.mockClear();

    await TestBed.configureTestingModule({
      imports: [MemberFormComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberFormComponent);
    fixture.componentRef.setInput('takenEmails', ['sarah@company.com']);
    fixture.componentInstance.saved.subscribe(onSaved);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('emits the trimmed name and email', async () => {
    await type('member-name', '  Emily Davis ');
    await type('member-email', ' emily@company.com ');

    await submit();

    expect(onSaved).toHaveBeenCalledWith({ name: 'Emily Davis', email: 'emily@company.com' });
  });

  it('does not save an empty form, and marks both fields as invalid', async () => {
    await submit();

    expect(onSaved).not.toHaveBeenCalled();
    expect(input('member-name').getAttribute('aria-invalid')).toBe('true');
    expect(input('member-email').getAttribute('aria-invalid')).toBe('true');
  });

  it('does not save an invalid email', async () => {
    await type('member-name', 'Emily Davis');
    await type('member-email', 'emily');

    await submit();

    expect(onSaved).not.toHaveBeenCalled();
  });

  it('does not save an email someone on the team already has, whatever its case', async () => {
    await type('member-name', 'Sarah Smith');
    await type('member-email', 'Sarah@Company.com');

    await submit();

    expect(onSaved).not.toHaveBeenCalled();
    expect(input('member-email').getAttribute('aria-invalid')).toBe('true');
  });
});
