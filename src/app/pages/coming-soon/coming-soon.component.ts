import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-coming-soon',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="title">{{ titleKey() | transloco }}</h1>
    <p class="message">{{ 'comingSoon' | transloco }}</p>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-8);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      box-shadow: var(--shadow-card);
      text-align: center;
    }

    .title {
      margin: 0;
      font-size: var(--font-size-xl);
    }

    .message {
      margin: var(--space-2) 0 0;
      color: var(--color-text-muted);
    }
  `,
})
export class ComingSoonComponent {
  readonly titleKey = input.required<string>();
}
