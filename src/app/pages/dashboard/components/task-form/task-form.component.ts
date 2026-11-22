import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import {
  Assignee,
  Task,
  PRIORITY_ICONS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskDraft,
  TaskPriority,
  TaskStatus,
} from '../../../../core/models/task.model';
import { maxItemLength, requiredText } from '../../../../shared/validators/form.validators';

const TAG_MAX_LENGTH = 20;

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly task = input<Task | null>(null);
  readonly users = input.required<Assignee[]>();
  readonly saving = input(false);

  readonly saved = output<TaskDraft>();
  readonly cancelled = output<void>();

  protected readonly statuses = [...TASK_STATUSES];
  protected readonly priorities = [...TASK_PRIORITIES];
  protected readonly tagMaxLength = TAG_MAX_LENGTH;

  protected readonly form = this.formBuilder.group({
    title: ['', requiredText],
    description: [''],
    status: this.formBuilder.control<TaskStatus>('todo', Validators.required),
    priority: this.formBuilder.control<TaskPriority>('medium', Validators.required),
    dueDate: ['', Validators.required],
    assigneeId: ['', Validators.required],
    tags: this.formBuilder.control<string[]>([], maxItemLength(TAG_MAX_LENGTH)),
  });

  // The dialog creates a new form each time it opens, so the inputs are read once here
  ngOnInit() {
    const task = this.task();
    if (!task) {
      return;
    }

    this.form.setValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: task.assignee.id,
      tags: task.tags,
    });
  }

  protected showError(control: AbstractControl) {
    return control.invalid && control.touched;
  }

  protected submit() {
    // Enter in a field submits even while the button is disabled
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { assigneeId, ...value } = this.form.getRawValue();
    const assignee = this.users().find((user) => user.id === assigneeId);
    if (!assignee) {
      return;
    }

    this.saved.emit({
      ...value,
      title: value.title.trim(),
      description: value.description.trim(),
      tags: value.tags.map((tag) => tag.trim()).filter(Boolean),
      assignee,
    });
  }

  protected priorityIcon(priority: TaskPriority) {
    return PRIORITY_ICONS[priority];
  }
}
