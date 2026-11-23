import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

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
        data: { search: 'tasks' },
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/analytics/analytics.component').then((m) => m.AnalyticsComponent),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./pages/activity/activity.component').then((m) => m.ActivityComponent),
        data: { search: 'activity' },
      },
      {
        path: 'team',
        loadComponent: () => import('./pages/team/team.component').then((m) => m.TeamComponent),
        data: { search: 'team' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
