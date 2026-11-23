import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../core/models/nav-item.model';

@Component({
  selector: 'app-sidebar-nav',
  imports: [TranslocoPipe, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavComponent {
  readonly linkSelected = output<void>();
  readonly newTask = output<void>();

  readonly navLinks: readonly NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: '📊' },
    { path: '/analytics', labelKey: 'nav.analytics', icon: '📈' },
    { path: '/activity', labelKey: 'nav.activity', icon: '🕒' },
    { path: '/team', labelKey: 'nav.team', icon: '👥' },
    { path: '/settings', labelKey: 'nav.settings', icon: '⚙️' },
  ];
}
