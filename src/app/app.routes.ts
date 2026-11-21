import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const loadComingSoon = () =>
  import('./pages/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent);

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      { path: 'tasks', loadComponent: loadComingSoon, data: { titleKey: 'nav.tasks' } },
      { path: 'calendar', loadComponent: loadComingSoon, data: { titleKey: 'nav.calendar' } },
      { path: 'analytics', loadComponent: loadComingSoon, data: { titleKey: 'nav.analytics' } },
      { path: 'team', loadComponent: loadComingSoon, data: { titleKey: 'nav.team' } },
      { path: 'settings', loadComponent: loadComingSoon, data: { titleKey: 'nav.settings' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
