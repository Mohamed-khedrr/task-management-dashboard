import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tooltip } from 'primeng/tooltip';
import { TruncateDirective } from './truncate.directive';

@Component({
  imports: [TruncateDirective],
  template: `
    <p id="one" appTruncate>Short text</p>
    <p id="two" appTruncate="2">A much longer text</p>
  `,
})
class HostComponent {}

describe('TruncateDirective', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const tooltip = (id: string) =>
      fixture.debugElement.children
        .find((child) => child.nativeElement.id === id)!
        .injector.get(Tooltip);
    return { element, tooltip };
  };

  it('clamps to one line by default and to the requested number of lines', async () => {
    const { element } = await setup();

    expect(element('one').style.getPropertyValue('--lines')).toBe('1');
    expect(element('two').style.getPropertyValue('--lines')).toBe('2');
  });

  it('uses the element text as the tooltip when hovered', async () => {
    const { element, tooltip } = await setup();

    element('two').dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltip('two').getOption('tooltipLabel')).toBe('A much longer text');
  });

  it('only shows the tooltip when the text overflows', async () => {
    const { tooltip } = await setup();

    expect(tooltip('one').getOption('showOnEllipsis')).toBe(true);
  });
});
