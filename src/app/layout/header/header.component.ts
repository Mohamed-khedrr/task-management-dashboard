import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { APP_INFO } from '../../core/config/app-info';
import { SearchService } from '../../core/services/search.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe, InputTextModule, NotificationsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly appInfo = APP_INFO;
  readonly menuToggle = output<void>();

  protected readonly search = inject(SearchService);
  protected readonly profile = inject(ProfileService);

  protected onSearch(event: Event) {
    this.search.text.set((event.target as HTMLInputElement).value);
  }
}
