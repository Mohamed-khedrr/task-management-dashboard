import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';

import { TaskColumnComponent } from './task-column.component';

describe('TaskColumnComponent', () => {
  let component: TaskColumnComponent;
  let fixture: ComponentFixture<TaskColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskColumnComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskColumnComponent);
    fixture.componentRef.setInput('status', 'todo');
    fixture.componentRef.setInput('tasks', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
