import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Drawer } from 'primeng/drawer';
import { APP_INFO } from '../../core/config/app-info';
import { LanguageService } from '../../core/i18n/language.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarNavComponent } from '../sidebar-nav/sidebar-nav.component';
import { Toast } from 'primeng/toast';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    SidebarNavComponent,
    Drawer,
    RouterOutlet,
    TranslocoPipe,
    Toast,
    TaskDialogComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly language = inject(LanguageService);

  protected readonly taskDialog = inject(TaskDialogService);

  protected readonly appInfo = APP_INFO;
  protected readonly menuOpen = signal(false);

  protected readonly drawerPosition = computed(() =>
    this.language.activeLang() === 'ar' ? 'right' : 'left',
  );

  protected readonly toastPosition = computed(() =>
    this.language.activeLang() === 'ar' ? 'top-left' : 'top-right',
  );
}
