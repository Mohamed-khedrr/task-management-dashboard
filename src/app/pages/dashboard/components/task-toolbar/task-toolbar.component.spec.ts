import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';

import { TaskToolbarComponent } from './task-toolbar.component';

describe('TaskToolbarComponent', () => {
  let component: TaskToolbarComponent;
  let fixture: ComponentFixture<TaskToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskToolbarComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskToolbarComponent);
    fixture.componentRef.setInput('status', 'all');
    fixture.componentRef.setInput('priority', null);
    fixture.componentRef.setInput('assigneeId', null);
    fixture.componentRef.setInput('users', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selects the status of the clicked tab', () => {
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.tab');
    tabs[3].click();

    expect(component.status()).toBe('done');
  });

  it('emits newTask when the button is clicked', () => {
    const onNewTask = vi.fn();
    component.newTask.subscribe(onNewTask);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('p-button button')!
      .click();

    expect(onNewTask).toHaveBeenCalledOnce();
  });
});
