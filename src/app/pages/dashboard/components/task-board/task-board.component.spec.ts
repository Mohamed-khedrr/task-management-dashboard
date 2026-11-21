import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';

import { TaskBoardComponent } from './task-board.component';

describe('TaskBoardComponent', () => {
  let component: TaskBoardComponent;
  let fixture: ComponentFixture<TaskBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    fixture.componentRef.setInput('columns', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
