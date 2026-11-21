import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../core/models/nav-item.model';

@Component({
  selector: 'app-sidebar-nav',
  imports: [TranslocoPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavComponent {
  readonly linkSelected = output<void>();

  readonly navLinks: readonly NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: '📊' },
    { path: '/tasks', labelKey: 'nav.tasks', icon: '✅' },
    { path: '/analytics', labelKey: 'nav.analytics', icon: '📈' },
    { path: '/team', labelKey: 'nav.team', icon: '👥' },
  ];
}
