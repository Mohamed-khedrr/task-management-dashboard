import { Directive, ElementRef, inject, input, numberAttribute } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  selector: '[appTruncate]',
  hostDirectives: [Tooltip],
  host: {
    class: 'truncate',
    '[style.--lines]': 'lines()',
    '(mouseenter)': 'updateTooltip()',
  },
})
export class TruncateDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly tooltip = inject(Tooltip);

  readonly lines = input(1, {
    alias: 'appTruncate',
    transform: (value: unknown) => numberAttribute(value, 1),
  });

  constructor() {
    this.tooltip.setOption({ showOnEllipsis: true });
  }

  protected updateTooltip() {
    this.tooltip.setOption({ tooltipLabel: this.element.textContent?.trim() });
  }
}
