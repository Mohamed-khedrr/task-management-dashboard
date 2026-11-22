import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { APP_INFO } from '../../core/config/app-info';
import { TaskFiltersService } from '../../core/services/task-filters.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe, InputTextModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly appInfo = APP_INFO;
  readonly menuToggle = output<void>();

  protected readonly filters = inject(TaskFiltersService);
  protected readonly profile = inject(ProfileService);

  protected onSearch(event: Event) {
    this.filters.search.set((event.target as HTMLInputElement).value);
  }
}
