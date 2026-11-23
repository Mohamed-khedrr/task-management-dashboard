import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { formatDayCount, formatRelativeDays } from '../../../../core/utils/relative-time';
import { getTaskTiming, isTaskOverdue } from '../../../../core/utils/task.utils';
import { Task } from '../../../../core/models/task.model';
import { LanguageService } from '../../../../core/i18n/language.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-task-card',
  imports: [TranslocoPipe, Menu, ProgressSpinner],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'task().status',
    '[class.overdue]': 'overdue()',
    '[class.deleting]': 'deleting()',
    '(window:resize)': 'checkOverflow()',
  },
})
export class TaskCardComponent {
  private readonly language = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly today = new Date();

  readonly task = input.required<Task>();
  readonly deleting = input(false);

  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();

  private readonly description = viewChild<ElementRef<HTMLElement>>('description');

  protected readonly expanded = signal(false);
  protected readonly canExpand = signal(false);

  constructor() {
    // Whether the text is cut is only known after it's laid out, so it's measured after each render
    afterRenderEffect(() => {
      this.task();
      this.checkOverflow();
    });
  }

  protected readonly overdue = computed(() => isTaskOverdue(this.task(), this.today));
  protected readonly menuItems = computed<MenuItem[]>(() => {
    const lang = this.language.activeLang();
    return [
      {
        label: this.transloco.translate('taskActions.edit', {}, lang),
        command: () => this.editRequested.emit(),
      },
      {
        label: this.transloco.translate('taskActions.delete', {}, lang),
        command: () => this.deleteRequested.emit(),
      },
    ];
  });

  protected readonly assigneeFirstName = computed(() => this.task().assignee.name.split(' ')[0]);

  protected readonly timing = computed(() => {
    const { kind, days } = getTaskTiming(this.task(), this.today);
    const lang = this.language.activeLang();

    switch (kind) {
      case 'overdue':
        return {
          icon: '⚠',
          key: 'task.timing.overdue',
          params: { duration: formatDayCount(days, lang) },
        };
      case 'completed':
        return {
          icon: '✅',
          key: 'task.timing.completed',
          params: { when: formatRelativeDays(-days, lang) },
        };
      case 'due':
        return {
          icon: '📅',
          key: 'task.timing.due',
          params: { when: formatRelativeDays(days, lang) },
        };
    }
  });

  protected checkOverflow() {
    const element = this.description()?.nativeElement;
    if (!element) {
      this.canExpand.set(false);
      return;
    }
    if (this.expanded()) {
      return;
    }
    this.canExpand.set(element.scrollHeight > element.clientHeight);
  }
}
