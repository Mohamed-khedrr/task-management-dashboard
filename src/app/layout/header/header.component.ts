import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { APP_INFO } from '../../core/config/app-info';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe, InputTextModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly appInfo = APP_INFO;
  menuToggle = output<void>();
}
