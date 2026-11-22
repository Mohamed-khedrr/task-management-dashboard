import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StackedBarCardComponent } from './stacked-bar-card.component';

describe('StackedBarCardComponent', () => {
  let fixture: ComponentFixture<StackedBarCardComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    // jsdom can't draw on a canvas; the chart itself isn't under test
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    fixture = TestBed.createComponent(StackedBarCardComponent);
    fixture.componentRef.setInput('title', 'Tasks per person');
    fixture.componentRef.setInput('labels', ['Sarah', 'John']);
    fixture.componentRef.setInput('series', [
      { label: 'To Do', values: [2, 0], color: '#1976d2' },
      { label: 'Done', values: [3, 1], color: '#388e3c' },
    ]);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows each series in the legend with its total', () => {
    const counts = Array.from(element.querySelectorAll('.count'), (count) => count.textContent);

    expect(counts).toEqual(['2', '4']);
  });

  it('describes each label with its value per series for screen readers', () => {
    const canvas = element.querySelector('canvas')!;

    expect(canvas.getAttribute('aria-label')).toBe('Sarah: 2 To Do, 3 Done; John: 0 To Do, 1 Done');
  });
});
